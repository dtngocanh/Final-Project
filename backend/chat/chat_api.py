import os
import time
import re
from typing import Dict, List, Any
from dotenv import load_dotenv

from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
# Thay vì import requests, ta dùng InferenceClient của Hugging Face
from huggingface_hub import InferenceClient 
import uvicorn

import threading
from scheduler import run_all

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
# 2. MONGODB & GROQ CONNECTION
# =====================================================
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME", "freshmart")]
collection = db[os.getenv("COLLECTION_NAME", "products")]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# =====================================================
# 3. TỰ ĐỘNG CHECK MÔI TRƯỜNG (LOCAL VS RENDER)
# =====================================================
IS_RENDER = os.getenv("RENDER") is not None

model_embedding = None
hf_client = None  # Khởi tạo client Hugging Face trực tuyến
HF_TOKEN = os.getenv("HF_TOKEN")

if IS_RENDER:
    print("[MOI TRUONG RENDER]: Dung API Hugging Face Online de TIET KIEM RAM (0MB)!")
    if HF_TOKEN:
        # Khởi tạo InferenceClient với token của bạn
        hf_client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)
    else:
        print("[HF API WARNING]: Thieu bien moi truong HF_TOKEN tren Render!")
else:
    print("[MOI TRUONG LOCAL]: Tai model Offline vao RAM de NE CHAN MANG VA DNS!")
    try:
        from sentence_transformers import SentenceTransformer
        model_embedding = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        print("Model Embedding Offline da san sang tai Local!")
    except Exception as e:
        print(f"Khong the load model offline tai Local: {e}. Vui long chay `pip install sentence-transformers` để test Local.")

embedding_cache: Dict[str, List[float]] = {}
chat_history: Dict[str, List[str]] = {}

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
# 4. HELPER FUNCTIONS (ĐÃ VIẾT LẠI BẰNG INFERENCECLIENT)
# =====================================================
def get_embedding(text: str) -> List[float]:
    """Hàm phân tách triệt để: Local xài offline hoàn toàn, Render xài InferenceClient mới"""
    text = text.strip().lower()
    if text in embedding_cache:
        return embedding_cache[text]
    
    # -------------------------------------------------
    # TRƯỜNG HỢP 1: CHẠY TRÊN RENDER -> DÙNG HUGGING FACE CLIENT
    # -------------------------------------------------
    if IS_RENDER:
        print(f"[EMBEDDING]: Dang goi InferenceClient Hugging Face cho: '{text}'")
        
        if not hf_client:
            print("[HF API ERROR]: hf_client chua duoc khoi tao do thieu HF_TOKEN!")
            return None

        max_retries = 3
        retry_delay = 2 
        
        for attempt in range(max_retries):
            try:
                # Sử dụng tính năng feature_extraction tích hợp sẵn của client mới
                # Phương thức này tương đương hoàn toàn với việc gọi POST lên model
                vector = hf_client.feature_extraction(
                    text,
                    model="sentence-transformers/all-MiniLM-L6-v2"
                )
                
                # Inference Client tự parse kết quả thành List/Array, không cần res.json()
                if isinstance(vector, list) or hasattr(vector, "tolist"):
                    if hasattr(vector, "tolist"):  # Phòng trường hợp trả về numpy array
                        vector = vector.tolist()
                    
                    embedding_cache[text] = vector
                    return vector
                
            except Exception as e:
                # Thư viện huggingface_hub tự động handle lỗi 503 (Model loading) và tự retry nội bộ.
                # Nếu lọt vào đây tức là lỗi timeout hoặc lỗi kết nối nặng.
                error_msg = str(e)
                print(f"[HF API RE-TRY]: Loi lay embedding lan {attempt + 1}: {error_msg}")
                
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    print("[HF API CRITICAL]: Da thu lai het 3 lan nhung ket noi Hugging Face that bai hoàn toan!")
        
        return None 

    # -------------------------------------------------
    # TRƯỜNG HỢP 2: CHẠY TẠI LOCAL -> CHẠY OFFLINE 100%
    # -------------------------------------------------
    else:
        print(f"[EMBEDDING]: Dang xu ly OFFLINE hoan toan bang RAM may cho: '{text}'")
        try:
            if model_embedding:
                vector_np = model_embedding.encode(text)
                vector = vector_np.tolist()
                embedding_cache[text] = vector
                return vector
            else:
                print("[LOCAL EMBEDDING ERROR]: Model chua duoc load thanh cong vao RAM. Vui long kiem tra `pip install sentence-transformers`")
        except Exception as e:
            print(f"[LOCAL EMBEDDING ERROR]: Loi chay offline: {e}")
        
        return []

def query_groq_llm(prompt: str) -> str:
    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=150
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"[GROQ LLM ERROR]: {e}")
        return ""

def detect_category_filter(message: str) -> Dict[str, Any]:
    msg = message.lower()
    for keyword, category in CATEGORY_KEYWORDS.items():
        if keyword in msg:
            return {"category": category}
    return {}

# =====================================================
# 5. MONGODB SEARCH LOGIC
# =====================================================
def batch_regex_search(keywords: List[str], cat_filter: dict) -> List[dict]:
    if not keywords:
        return []
    regex_list = [{"name": {"$regex": re.escape(kw), "$options": "i"}} for kw in keywords[:5]]
    query = {"$or": regex_list}
    if cat_filter:
        query.update(cat_filter)
    return list(collection.find(query).limit(10))

def vector_product_search(query_vector: List[float], cat_filter: dict) -> List[dict]:
    if not query_vector:
        return []
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
# CRON JOB
# Trong file chat_api.py
from scheduler import run_all

import threading
from scheduler import run_all

@app.get("/trigger-all")
def trigger_all(secret: str):
    if secret != os.getenv("CRON_SECRET"):
        return {"error": "Unauthorized"}
    
    # Chạy quy trình nạp trong 1 Thread tách biệt
    # Thread này sẽ chạy độc lập, API sẽ trả về kết quả ngay lập tức
    # Điều này khiến Render thấy API đã xong và không ngắt server nữa
    threading.Thread(target=run_all, daemon=True).start()
    
    return {"status": "Pipeline initiated in background"}

# =====================================================
# 6. MAIN API ENDPOINT
# =====================================================
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

        extraction_prompt = f"""Analyze the user's shopping request: "{message}"
Format your response STRICTLY in one of these two ways:
1. If they want to make/cook a dish: "RECIPE | [Dish Name] | [ingredient1, ingredient2, ingredient3]"
2. If they just want to search products: "SEARCH | None | [keyword1, keyword2]"
Do not say anything else.
Answer:"""
       
        ai_analysis = query_groq_llm(extraction_prompt)
        print(f"[2. AI EXTRACTION]: {ai_analysis}")

        search_keywords = []
        is_recipe = False
        dish_name = ""
        required_ingredients_str = ""

        if "|" in ai_analysis:
            parts = [p.strip() for p in ai_analysis.split("|")]
            if len(parts) >= 3:
                intent_type = parts[0].upper()
                dish_name = parts[1]
                required_ingredients_str = parts[2]
                search_keywords = [kw.strip().lower() for kw in required_ingredients_str.split(",") if len(kw.strip()) > 2]
                if "RECIPE" in intent_type:
                    is_recipe = True

        cat_filter = detect_category_filter(message)
        search_results = []

        if search_keywords:
            search_results = batch_regex_search(search_keywords, cat_filter)

        if len(search_results) == 0:
            query_vector = get_embedding(message)
            
            if query_vector is None:
                return {
                    "answer": "I'm sorry, our connection to the AI server is a bit unstable right now. Could you please try again in a few seconds?", 
                    "products": []
                }
                
            search_results = vector_product_search(query_vector, cat_filter)

        print(f"[INFO] Database yielded {len(search_results)} matching items.")

        stock_list = []
        for item in search_results:
            clean_name = item['name'].replace('-', ' ').replace('_', ' ').title()
            stock_list.append(f"- {clean_name} (${item.get('price', 0)})")
       
        available_stock = "\n".join(stock_list) if stock_list else "None"
       
        expert_context = ""
        if is_recipe:
            expert_context = f"""The user wants to make {dish_name}.
RULE: You MUST start your response by saying something like: "To make {dish_name}, you typically need {required_ingredients_str}."
Then, warmly tell them which of those ingredients we currently have from the ITEMS IN STOCK."""

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
       
        ai_answer = query_groq_llm(prompt)
        if "ASSISTANT:" in ai_answer:
            ai_answer = ai_answer.split("ASSISTANT:")[-1].strip()

        print(f"[3. AI FINAL ANSWER]: {ai_answer}")

        chat_history[session_id].append(f"User: {message}")
        chat_history[session_id].append(f"Assistant: {ai_answer}")
        if len(chat_history[session_id]) > 4:
            chat_history[session_id] = chat_history[session_id][-4:]

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