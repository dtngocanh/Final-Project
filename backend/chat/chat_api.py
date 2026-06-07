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
# THAY THẾ OLLAMA BẰNG CÁC THƯ VIỆN CLOUD-FRIENDLY
# =====================================================
from groq import Groq
from sentence_transformers import SentenceTransformer

# =====================================================
# 1. ENV & APP CONFIG
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
# 2. MONGODB CONNECTION
# =====================================================
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client[os.getenv("DB_NAME", "freshmart")]
collection = db[os.getenv("COLLECTION_NAME", "products")]

# =====================================================
# 3. AI INITIALIZATION (SIÊU TỐC ĐỘ VỚI GROQ & LOCAL CPU)
# =====================================================
print("--- RUNNING WITH GROQ & SENTENCE TRANSFORMERS (CLOUD-FRIENDLY MODE) ---")

# Load model nhẹ để tạo vector trên CPU Render
embedding_model = SentenceTransformer('nomic-ai/nomic-embed-text-v1.5', trust_remote_code=True)

# Khởi tạo Groq Client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Cache System
chat_history: Dict[str, List[str]] = {}
embedding_cache: Dict[str, List[float]] = {}

CATEGORY_KEYWORDS = {
    "fruit": "Fruits", "apple": "Fruits", "banana": "Fruits",
    "juice": "Juices", "drink": "Juices",
    "vegetable": "Vegetables", "salad": "Vegetables",
    "fish": "Seafood", "shrimp": "Seafood", "seafood": "Seafood",
    "milk": "Dairy", "pork": "Meat", "beef": "Meat", "meat": "Meat"
}

SMALL_TALKS = {
    "hi": "Hello! Welcome to Veganic Mart. How can I assist you today?",
    "hello": "Hello! Welcome to Veganic Mart. How can I assist you today?",
    "hey": "Hi there! What are you looking for today?",
    "thanks": "You're very welcome!",
    "thank you": "You're very welcome!",
}

# =====================================================
# 4. HELPER FUNCTIONS
# =====================================================
def get_embedding(text: str) -> List[float]:
    text = text.strip().lower()
    if text in embedding_cache:
        return embedding_cache[text]
    
    # Tạo vector trực tiếp trên CPU, không cần Ollama server
    vector = embedding_model.encode(text).tolist()
    
    if len(embedding_cache) > 500:
        embedding_cache.clear()
    embedding_cache[text] = vector
    return vector

def get_chat_response(prompt: str) -> str:
    # Gọi Groq cực nhanh thay vì Ollama local
    completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.1,
        max_tokens=200
    )
    return completion.choices[0].message.content

def detect_category_filter(message: str) -> Dict[str, Any]:
    msg = message.lower()
    for keyword, category in CATEGORY_KEYWORDS.items():
        if keyword in msg:
            return {"category": category}
    return {}

# =====================================================
# 5. MONGODB HYBRID SEARCH (TỐI ƯU 1-PASS)
# =====================================================
def batch_regex_search(keywords: List[str], cat_filter: dict) -> List[dict]:
    if not keywords:
        return []
    
    # Chỉ lấy tối đa 5 từ khóa quan trọng nhất để DB quét cực nhanh
    regex_list = [{"name": {"$regex": re.escape(kw), "$options": "i"}} for kw in keywords[:5]]
    query = {"$or": regex_list}
    if cat_filter:
        query.update(cat_filter)
        
    return list(collection.find(query).limit(10))

def vector_product_search(query_vector: List[float], cat_filter: dict) -> List[dict]:
    vector_search_stage = {
        "index": "vector_index",
        "path": "embedding",
        "queryVector": query_vector,
        "numCandidates": 20,
        "limit": 6
    }
    pipeline = [
        {"$vectorSearch": vector_search_stage},
        {"$addFields": {"search_score": {"$meta": "vectorSearchScore"}}},
        {"$match": {"search_score": {"$gte": 0.65}}}, 
        {"$project": {"_id": 1, "name": 1, "price": 1, "images": 1, "category": 1}}
    ]
    return list(collection.aggregate(pipeline))

class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest"

# =====================================================
# 6. MAIN API ENDPOINT
# =====================================================
# Lưu ý: Bỏ 'async' ở def để tránh blocking event loop khi dùng PyMongo (giúp API chịu tải tốt hơn)
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        total_start = time.time()
        message = request.message.strip()
        session_id = request.session_id

        print("\n" + "=" * 60)
        print(f"[1. USER MESSAGE]: {message}")

        if message.lower() in SMALL_TALKS:
            return {"answer": SMALL_TALKS[message.lower()], "products": []}

        if session_id not in chat_history:
            chat_history[session_id] = []

        # ---------------------------------------------------------
        # BƯỚC 1: ÉP AI TRẢ KẾT QUẢ THEO FORM CHUẨN (Tốc độ ánh sáng)
        # ---------------------------------------------------------
        extraction_prompt = f"""Analyze the user's shopping request: "{message}"
Format your response STRICTLY in one of these two ways:
1. If they want to make/cook a dish: "RECIPE | [Dish Name] | [ingredient1, ingredient2, ingredient3]"
2. If they just want to search products: "SEARCH | None | [keyword1, keyword2]"
Do not say anything else.
Answer:"""
        
        # Đã cập nhật để dùng Groq
        ai_analysis = get_chat_response(extraction_prompt).strip()
        print(f"[2. AI EXTRACTION]: {ai_analysis}")

        search_keywords = []
        is_recipe = False
        dish_name = ""
        required_ingredients_str = ""

        # Phân rã chuỗi AI trả về
        if "|" in ai_analysis:
            parts = [p.strip() for p in ai_analysis.split("|")]
            if len(parts) >= 3:
                intent_type = parts[0].upper()
                dish_name = parts[1]
                required_ingredients_str = parts[2]
                
                # Biến chuỗi "apple, banana" thành mảng ['apple', 'banana']
                search_keywords = [kw.strip().lower() for kw in required_ingredients_str.split(",") if len(kw.strip()) > 2]
                if "RECIPE" in intent_type:
                    is_recipe = True

        cat_filter = detect_category_filter(message)
        search_results = []

        # ---------------------------------------------------------
        # BƯỚC 2: TÌM TRONG DATABASE BẰNG REGEX SIÊU TỐC
        # ---------------------------------------------------------
        if search_keywords:
            search_results = batch_regex_search(search_keywords, cat_filter)

        # Fallback nếu Regex không ra kết quả
        if len(search_results) == 0:
            query_vector = get_embedding(message)
            search_results = vector_product_search(query_vector, cat_filter)

        print(f"[INFO] Database yielded {len(search_results)} matching items.")

        # ---------------------------------------------------------
        # BƯỚC 3: DỰNG NGỮ CẢNH (CONTEXT) ĐỂ TƯ VẤN NHƯ CHUYÊN GIA
        # ---------------------------------------------------------
        stock_list = []
        for item in search_results:
            clean_name = item['name'].replace('-', ' ').replace('_', ' ').title()
            stock_list.append(f"- {clean_name} (${item.get('price', 0)})")
        
        available_stock = "\n".join(stock_list) if stock_list else "None"
        
        # Bơm ngữ cảnh tư vấn vào cho AI
        expert_context = ""
        if is_recipe:
            expert_context = f"""The user wants to make {dish_name}. 
RULE: You MUST start your response by saying something like: "To make {dish_name}, you typically need {required_ingredients_str}." 
Then, warmly tell them which of those ingredients we currently have from the ITEMS IN STOCK."""

        # ---------------------------------------------------------
        # BƯỚC 4: AI CHỐT CÂU TRẢ LỜI CUỐI CÙNG
        # ---------------------------------------------------------
        llm_start = time.time()
        prompt = f"""You are a smart, friendly shopping assistant for Veganic Mart.
[RULES]
1. Reply concisely in English (max 3-4 sentences).
2. Look strictly at the ITEMS IN STOCK. 
3. {expert_context}
4. If stock is "None", reply EXACTLY: "I'm sorry, we don't have ingredients for that at the moment."
5. DO NOT recommend or mention prices for products not listed in stock.

ITEMS IN STOCK:
{available_stock}

CUSTOMER: {message}
ASSISTANT:"""
        
        # Đã cập nhật để dùng Groq
        ai_answer = get_chat_response(prompt).strip()
        if "ASSISTANT:" in ai_answer:
            ai_answer = ai_answer.split("ASSISTANT:")[-1].strip()

        print(f"[3. AI FINAL ANSWER]: {ai_answer}")
        print(f"[INFO] Groq Latency: {time.time() - llm_start:.2f}s")

        # Lưu lịch sử chat
        chat_history[session_id].append(f"User: {message}")
        chat_history[session_id].append(f"Assistant: {ai_answer}")
        if len(chat_history[session_id]) > 4:
            chat_history[session_id] = chat_history[session_id][-4:]

        # ---------------------------------------------------------
        # BƯỚC 5: XUẤT RA DỮ LIỆU SẢN PHẨM CHO GIAO DIỆN
        # ---------------------------------------------------------
        products = []
        ai_lower = ai_answer.lower()
        
        if "i'm sorry" in ai_lower or "don't have" in ai_lower or available_stock == "None":
            pass 
        else:
            for doc in search_results:
                image_url = ""
                if isinstance(doc.get("images"), list) and len(doc["images"]) > 0:
                    image_url = doc["images"][0].get("url", "")

                products.append({
                    "id": str(doc["_id"]),
                    "name": doc["name"], 
                    "price": doc.get("price", 0),
                    "image": image_url
                })

        print(f"[INFO] TOTAL ROUND-TRIP: {time.time() - total_start:.2f}s\n" + "=" * 60)
        
        return {"answer": ai_answer, "products": products[:6]}

    except Exception as e:
        print("[CRITICAL ERROR]:", str(e))
        return {"answer": "I'm sorry, our system encountered a brief error. Could you try asking again?", "products": []}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)