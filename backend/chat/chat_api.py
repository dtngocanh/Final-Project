import os
import time
import re
import json
from typing import Dict, List, Any
from dotenv import load_dotenv

from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from huggingface_hub import InferenceClient 
import uvicorn

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
# 3. ENVIRONMENT CHECK (LOCAL VS RENDER)
# =====================================================
IS_RENDER = os.getenv("RENDER") is not None
model_embedding = None
hf_client = None  
HF_TOKEN = os.getenv("HF_TOKEN")

if IS_RENDER:
    print("[ENVIRONMENT]: Render detected. Using online Hugging Face Client.")
    if HF_TOKEN:
        hf_client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)
    else:
        print("[WARNING]: Missing HF_TOKEN on Render environment!")
else:
    print("[ENVIRONMENT]: Local detected. Loading offline model to avoid network lag.")
    try:
        from sentence_transformers import SentenceTransformer
        model_embedding = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    except Exception as e:
        print(f"Cannot load offline model: {e}")

embedding_cache: Dict[str, List[float]] = {}
chat_history: Dict[str, List[str]] = {}

# Cấu hình địa chỉ Ngũ Hành Sơn & Biểu phí cân nặng chuẩn GHN
STORE_INFO = """
[STORE INFORMATION & GHN WEIGHT-BASED SHIPPING]
- Store Name: Veggies Mart (Veganic Mart project)
- Address: 150 Ngu Hanh Son, My An, Ngu Hanh Son, Da Nang, Vietnam
- Contact Phone / Zalo: 0901234567

- Shipping Partner: Giao Hang Nhanh (GHN Express)
- Shipping Services available: GHN Fast (1-2 days) and GHN Express (Same-day within 4 hours).

- GHN Weight-Based Shipping Fees (Calculated by Total Order Weight):
  * Package from 0kg to 2kg: Flat rate $1.2 (approx. 30,000 VND) for inner Da Nang.
  * Package from 2kg to 5kg: Flat rate $2.0 (approx. 50,000 VND).
  * Package over 5kg: Base fee $2.0 + $0.2 for each additional 1kg.
  * Free Shipping Policy: Free shipping for all orders over $40 (and total weight under 10kg).

- Cash on Delivery (COD): Supported via GHN with 0% extra fee.
"""

SMALL_TALKS = {
    "hi": "Hello! Welcome to Veggies Mart. How can I help you today?",
    "hello": "Hello! Welcome to Veggies Mart. How can I help you today?",
    "hey": "Hi there! What fresh products are you looking for today?",
    "thanks": "You are very welcome!",
    "thank you": "You are very welcome!",
}

# =====================================================
# 4. HELPER FUNCTIONS
# =====================================================
def get_embedding(text: str) -> List[float]:
    text = text.strip().lower()
    if text in embedding_cache:
        return embedding_cache[text]
    
    if IS_RENDER:
        if not hf_client:
            return None
        try:
            vector = hf_client.feature_extraction(text, model="sentence-transformers/all-MiniLM-L6-v2")
            if hasattr(vector, "tolist"):
                vector = vector.tolist()
            embedding_cache[text] = vector
            return vector
        except Exception as e:
            print(f"[HF EMBEDDING ERROR]: {e}")
            return None 
    else:
        try:
            if model_embedding:
                vector = model_embedding.encode(text).tolist()
                embedding_cache[text] = vector
                return vector
        except Exception as e:
            print(f"[LOCAL EMBEDDING ERROR]: {e}")
        return []

def query_groq_llm(prompt: str) -> str:
    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            max_tokens=250 
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"[GROQ LLM ERROR]: {e}")
        return ""

def advanced_regex_search(user_message: str) -> List[dict]:
    clean_msg = re.sub(r'[^\w\s]', '', user_message.lower())
    words = [w.strip() for w in clean_msg.split() if len(w.strip()) > 2]
    
    if not words:
        return []
    
    regex_conditions = [{"name": {"$regex": re.escape(word), "$options": "i"}} for word in words[:4]]
    query = {"$or": regex_conditions}
    
    return list(collection.find(query).limit(12))

def vector_product_search(query_vector: List[float]) -> List[dict]:
    if not query_vector:
        return []
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 20,
                "limit": 6
            }
        },
        {"$addFields": {"search_score": {"$meta": "vectorSearchScore"}}},
        {"$match": {"search_score": {"$gte": 0.60}}}, 
        {"$project": {"_id": 1, "name": 1, "price": 1, "images": 1, "category": 1, "weight": 1}}
    ]
    return list(collection.aggregate(pipeline))

class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest"

# =====================================================
# 5. MAIN API ENDPOINT
# =====================================================
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        total_start = time.time()
        message = request.message.strip()
        session_id = request.session_id

        print(f"\n--- [USER MESSAGE]: {message} ---")

        if message.lower() in SMALL_TALKS:
            return {"answer": SMALL_TALKS[message.lower()], "products": []}

        # --- BƯỚC 1: TÌM KIẾM SẢN PHẨM TRƯỚC ---
        search_results = advanced_regex_search(message)
        
        if len(search_results) == 0:
            query_vector = get_embedding(message)
            if query_vector:
                search_results = vector_product_search(query_vector)

        # Chuẩn bị danh sách tồn kho có kèm CÂN NẶNG của từng món để LLM tính toán
        stock_list = []
        for item in search_results:
            clean_name = item['name'].replace('-', ' ').replace('_', ' ').title()
            # Nếu chưa có field weight trong DB, mặc định gán 0.5kg để bot có dữ liệu tính
            weight = item.get('weight', 0.5) 
            stock_list.append(f"- {clean_name} (${item.get('price', 0)}) | Weight: {weight}kg")
        available_stock = "\n".join(stock_list) if stock_list else "None"

        # --- BƯỚC 2: 1-LLM CALL (Gộp xử lý thông tin kho + Phí ship cân nặng) ---
        prompt = f"""You are a smart, fast shopping assistant for Veggies Mart.
Our shop is located in Ngu Hanh Son district, Da Nang.

{STORE_INFO}

ITEMS IN STOCK CURRENTLY (WITH WEIGHTS):
{available_stock}

[INSTRUCTIONS]
1. Read the CUSTOMER message. Check if they ask about products, recipes, or shipping costs based on weight.
2. Reply friendly and flexibly in simple English (maximum 3 sentences).
3. If they ask about shipping fees, calculate using the GHN rules above based on the total weight of items they want.
4. At the very end of your response, you MUST output a technical JSON block containing the intent analysis:
[INTENT_JSON]
{{"intent": "SHIPPING" or "CONTACT" or "PRODUCT" or "RECIPE", "dish_name": "Name of dish or None"}}
[/INTENT_JSON]

CUSTOMER: {message}
ASSISTANT:"""
        
        ai_raw_response = query_groq_llm(prompt)
        
        ai_answer = ai_raw_response
        intent_data = {"intent": "PRODUCT", "dish_name": None}
        
        if "[INTENT_JSON]" in ai_raw_response:
            parts = ai_raw_response.split("[INTENT_JSON]")
            ai_answer = parts[0].strip()
            json_str_part = parts[1].split("[/INTENT_JSON]")[0].strip()
            try:
                intent_data = json.loads(json_str_part)
            except Exception:
                pass

        print(f"[AI RESPONSE TEXT]: {ai_answer}")
        print(f"[AI INTENT EXTRACT]: {intent_data}")

        # --- BƯỚC 3: ĐÓNG GÓI SẢN PHẨM TRẢ VỀ FRONT-END ---
        products_payload = []
        ai_lower = ai_answer.lower()
        
        if not ("sorry" in ai_lower and "don't have" in ai_lower) and available_stock != "None":
            for doc in search_results:
                image_url = ""
                if isinstance(doc.get("images"), list) and len(doc["images"]) > 0:
                    image_url = doc["images"][0].get("url", "")

                products_payload.append({
                    "id": str(doc["_id"]),
                    "name": doc["name"],
                    "price": doc.get("price", 0),
                    "image": image_url,
                    "weight": doc.get("weight", 0.5) # Trả thêm cân nặng về client nếu cần dùng
                })

        print(f"[INFO] ROUND-TRIP TIME: {time.time() - total_start:.2f}s")
        return {"answer": ai_answer, "products": products_payload[:6]}

    except Exception as e:
        print("[CRITICAL ERROR]:", str(e))
        return {"answer": "I'm sorry, our system encountered an error. Please try again.", "products": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)