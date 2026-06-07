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
# Đã thay đổi: Dùng model all-MiniLM-L6-v2 để tối ưu RAM
from sentence_transformers import SentenceTransformer

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. MONGODB CONNECTION
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client[os.getenv("DB_NAME", "freshmart")]
collection = db[os.getenv("COLLECTION_NAME", "products")]

# 3. AI INITIALIZATION (Tối ưu cho RAM 512MB)
print("--- RUNNING WITH GROQ & LIGHTWEIGHT EMBEDDING (all-MiniLM-L6-v2) ---")

# Dùng model siêu nhẹ, không cần trust_remote_code=True
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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

# 4. HELPER FUNCTIONS
def get_embedding(text: str) -> List[float]:
    text = text.strip().lower()
    if text in embedding_cache:
        return embedding_cache[text]
    
    # Tạo vector trực tiếp trên CPU
    vector = embedding_model.encode(text).tolist()
    
    if len(embedding_cache) > 500:
        embedding_cache.clear()
    embedding_cache[text] = vector
    return vector

def get_chat_response(prompt: str) -> str:
    # Gọi Groq cực nhanh
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

# 5. MONGODB HYBRID SEARCH (TỐI ƯU 1-PASS)
def batch_regex_search(keywords: List[str], cat_filter: dict) -> List[dict]:
    if not keywords:
        return []
    
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
        {"$match": {"search_score": {"$gte": 0.5}}}, 
        {"$project": {"_id": 1, "name": 1, "price": 1, "images": 1, "category": 1}}
    ]
    return list(collection.aggregate(pipeline))

class ChatRequest(BaseModel):
    message: str
    session_id: str = "guest"

# 6. MAIN API ENDPOINT
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        total_start = time.time()
        message = request.message.strip()
        session_id = request.session_id

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
        
        ai_analysis = get_chat_response(extraction_prompt).strip()

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
            search_results = vector_product_search(query_vector, cat_filter)

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
        
        ai_answer = get_chat_response(prompt).strip()
        if "ASSISTANT:" in ai_answer:
            ai_answer = ai_answer.split("ASSISTANT:")[-1].strip()

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
        
        return {"answer": ai_answer, "products": products[:6]}

    except Exception as e:
        print("[CRITICAL ERROR]:", str(e))
        return {"answer": "I'm sorry, our system encountered a brief error. Could you try asking again?", "products": []}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)