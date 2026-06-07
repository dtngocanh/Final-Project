import os
import time
import re
from typing import Dict, List, Any
from dotenv import load_dotenv

from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# =====================================================
# ENV & APP CONFIG
# =====================================================
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# MONGODB CONNECTION
# =====================================================
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

# =====================================================
# DYNAMIC AI INITIALIZATION (CHỌN NÃO THEO MÔI TRƯỜNG)
# =====================================================
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()

ollama_embeddings = None
ollama_llm = None
gemini_client = None
GEMINI_MODEL = None

if LLM_PROVIDER == "gemini":
    print("--- RUNNING WITH GEMINI API (DEPLOY PRODUCTION MODE) ---")
    from google import genai
    from google.genai import types
    gemini_client = genai.Client()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
else:
    print("--- RUNNING WITH OLLAMA + LANGCHAIN (LOCAL DEVELOPMENT MODE) ---")
    from langchain_ollama import OllamaEmbeddings, OllamaLLM
    ollama_embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
    ollama_llm = OllamaLLM(model=os.getenv("LLM_MODEL"), temperature=0.1) # Hạ thấp temp để bớt ngáo

# =====================================================
# MEMORY & CACHE
# =====================================================
chat_history: Dict[str, List[str]] = {}
embedding_cache: Dict[str, List[float]] = {}

# Từ điển ánh xạ Category cứng
CATEGORY_KEYWORDS = {
    "fruit": "Fruits", "apple": "Fruits", "banana": "Fruits",
    "juice": "Juices", "drink": "Juices",
    "vegetable": "Vegetables",
    "fish": "Seafood", "shrimp": "Seafood", "seafood": "Seafood"
}

SMALL_TALKS = {
    "hi": "Hello! How can I help you today?",
    "hello": "Hello! How can I help you today?",
    "hey": "Hi! What are you looking for today?",
    "thanks": "You're welcome!",
    "thank you": "You're welcome!",
    "ok": "Got it.",
    "haha": "😄",
}

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def normalize_text(text: str) -> str:
    """Chuẩn hóa chuỗi tìm kiếm giống tên searchName lưu dưới DB"""
    return text.lower().replace("-", " ").replace("_", " ").strip()


def detect_intent(message: str) -> str:
    """Nhận diện mục đích của khách hàng"""
    msg = message.lower()
    if any(word in msg for word in ["recommend", "suggest", "best", "healthy", "good for"]):
        return "recommend"
    if any(word in msg for word in ["price", "cost", "how much"]):
        return "price"
    return "search"


def detect_category_filter(message: str) -> Dict[str, Any]:
    """Phát hiện nếu user đang ám chỉ cụ thể một danh mục hàng hóa nào đó"""
    msg = message.lower()
    for keyword, category in CATEGORY_KEYWORDS.items():
        if keyword in msg:
            return {"category": category}
    return {}


def get_embedding(text: str) -> List[float]:
    """Tự động chuyển đổi giữa Gemini Embedding và Ollama Embedding kèm Cache"""
    text = text.strip().lower()
    if text in embedding_cache:
        return embedding_cache[text]

    if LLM_PROVIDER == "gemini":
        response = gemini_client.models.embed_content(
            model="text-embedding-004",
            contents=text
        )
        vector = response.embeddings[0].values
    else:
        vector = ollama_embeddings.embed_query(text)
    
    if len(embedding_cache) > 500:
        embedding_cache.clear()
        
    embedding_cache[text] = vector
    return vector

# =====================================================
# HYBRID SEARCH ENGINE
# =====================================================

def exact_product_search(keyword: str, cat_filter: dict) -> List[dict]:
    query = {"searchName": normalize_text(keyword)}
    query.update(cat_filter)
    return list(collection.find(query).limit(5))


def partial_product_search(keyword: str, cat_filter: dict) -> List[dict]:
    query = {"searchName": {"$regex": re.escape(normalize_text(keyword)), "$options": "i"}}
    query.update(cat_filter)
    return list(collection.find(query).limit(5))


def vector_product_search(query_vector: List[float], cat_filter: dict) -> List[dict]:
    """Vector Search nâng cấp với bộ lọc ngưỡng tương đồng chống quét bừa"""
    vector_search_stage = {
        "index": "vector_index",
        "path": "embedding",
        "queryVector": query_vector,
        "numCandidates": 20,
        "limit": 5
    }
    if cat_filter:
        vector_search_stage["filter"] = cat_filter

    pipeline = [
        {"$vectorSearch": vector_search_stage},
        {"$addFields": {"search_score": {"$meta": "vectorSearchScore"}}},
        {"$match": {"search_score": {"$gte": 0.7}}},  # Ngưỡng tương đồng tối thiểu
        {"$project": {"_id": 1, "name": 1, "price": 1, "images": 1, "category": 1}}
    ]
    return list(collection.aggregate(pipeline))


class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest"

# =====================================================
# CHAT API ENDPOINT
# =====================================================
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        total_start = time.time()
        message = request.message.strip()
        session_id = request.session_id

        print("\n" + "=" * 60)
        print(f"MESSAGE VIA [{LLM_PROVIDER.upper()}]:", message)

        # 1. SMALL TALK CHECK
        if message.lower() in SMALL_TALKS:
            return {"answer": SMALL_TALKS[message.lower()], "products": []}

        if session_id not in chat_history:
            chat_history[session_id] = []

        # 2. INTENT & CATEGORY DETECTION
        intent = detect_intent(message)
        cat_filter = detect_category_filter(message)

        # 3. MULTI-LEVEL SEARCH STRATEGY
        search_results = []
        search_type = ""

        if intent == "search":
            search_results = exact_product_search(message, cat_filter)
            search_type = "EXACT"

        if not search_results:
            search_results = partial_product_search(message, cat_filter)
            search_type = "PARTIAL"

        if not search_results or intent == "recommend":
            query_vector = get_embedding(message)
            search_results = vector_product_search(query_vector, cat_filter)
            search_type = "VECTOR"

        print(f"Strategy: {search_type} | Found: {len(search_results)} items")

        # 4. PREPARE CONTEXT
        history_context = "\n".join(chat_history[session_id][-2:])
        product_info = "\n".join([
            f"- Name: {item['name']} | Price: ${item.get('price', 0)} | Category: {item.get('category', 'N/A')}"
            for item in search_results
        ])

        # 5. CALL MODEL (Tự chọn kịch bản theo biến môi trường)
        llm_start = time.time()
        
        if LLM_PROVIDER == "gemini":
            # --- LUỒNG XỬ LÝ ĐỘC LẬP BẰNG GEMINI SDK ---
            system_instruction = """You are an elite, direct shopping assistant for Veganic Mart.
Rules:
1. Language: Answer in English.
2. Length: MAXIMUM 2 short sentences. Be extremely concise.
3. Strictness: ONLY talk about and recommend products explicitly listed in the <PRODUCT_LIST> below.
4. Honesty: If the product requested by the customer is NOT in the <PRODUCT_LIST>, say "I'm sorry, we don't have that product at the moment." and DO NOT invent or recommend alternative products from outside the list.
5. Category Isolation: Fruit and Juice are different categories."""

            user_content = f"""<PRODUCT_LIST>
{product_info if product_info else "No products matching this request in our stock."}
</PRODUCT_LIST>
<CONVERSATION_HISTORY>
{history_context}
</CONVERSATION_HISTORY>
CUSTOMER: {message}"""

            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.1,
                    max_output_tokens=150
                ),
            )
            ai_answer = response.text.strip()
            
        else:
            # --- LUỒNG XỬ LÝ BẰNG OLLAMA LOCAL + LANGCHAIN ---
            prompt = f"""You are an elite, direct shopping assistant for Veganic Mart.
            
Rules:
- Answer in English.
- Answer under 2 sentences. Maximize conciseness.
- Recommend ONLY products listed in the PRODUCT LIST below.
- If the product requested by customer is NOT in the PRODUCT LIST, say "I'm sorry, we don't have that product at the moment." Do not invent or recommend alternative products.
- Fruit and Juice are DIFFERENT categories.

PRODUCT LIST:
{product_info if product_info else "No products matching this request in our stock."}

Recent Chat:
{history_context}

CUSTOMER: {message}
ANSWER:"""
            ai_answer = ollama_llm.invoke(prompt).strip()

        print(f"LLM Response Time: {time.time() - llm_start:.2f}s")

        # 6. SAVE HISTORY
        chat_history[session_id].append(f"User: {message}")
        chat_history[session_id].append(f"Assistant: {ai_answer}")
        if len(chat_history[session_id]) > 4:
            chat_history[session_id] = chat_history[session_id][-4:]

        # 7. PRODUCT CARD FILTER (Khắc phục triệt để lỗi so khớp bừa bãi)
        products = []
        ai_lower = ai_answer.lower()
        
        for doc in search_results:
            doc_name_lower = doc["name"].lower()
            
            # Sử dụng Regex biên từ \b để so khớp chính xác nguyên cụm từ
            # Tránh lỗi: AI nói "Orange juice" mà hệ thống lại duyệt nhầm cả card của quả "Orange"
            pattern = rf"\b{re.escape(doc_name_lower)}\b"
            is_name_mentioned = bool(re.search(pattern, ai_lower))
            
            if (intent == "search") or is_name_mentioned:
                image_url = ""
                if isinstance(doc.get("images"), list) and len(doc["images"]) > 0:
                    image_url = doc["images"][0].get("url", "")

                products.append({
                    "id": str(doc["_id"]),
                    "name": doc["name"],
                    "price": doc.get("price", 0),
                    "image": image_url
                })

        print(f"TOTAL TIME: {time.time() - total_start:.2f}s\n" + "=" * 60)
        return {"answer": ai_answer, "products": products}

    except Exception as e:
        print("ERROR:", str(e))
        return {"answer": "I'm sorry, I hit a snag. Please ask again!", "products": []}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)