import os
import sys
from dotenv import load_dotenv 
from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. Load environment variables
load_dotenv()

app = FastAPI()

# 2. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. MongoDB Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

# 4. Initialize AI Model
embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))
llm = OllamaLLM(model=os.getenv("LLM_MODEL"), temperature=0.2)

# --- CHAT HISTORY STORAGE ---
chat_history = {} 

class ChatRequest(BaseModel):
    message: str
    session_id: str = "user_default"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        s_id = request.session_id
        if s_id not in chat_history:
            chat_history[s_id] = []

        # 1. VECTOR SEARCH (Find products in DB)
        query_vector = embeddings.embed_query(request.message)
        pipeline = [
            {"$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 50,
                "limit": 5 
            }},
            {"$project": {"_id": 1, "name": 1, "price": 1, "images": 1, "category": 1}}
        ]
        search_results = list(collection.aggregate(pipeline))
        
        # 2. PREPARE CONTEXT & COMPACT HISTORY
        history_context = "\n".join(chat_history[s_id][-4:]) 
        product_info = "\n".join([f"- {d['name']} (${d['price']}) [Category: {d.get('category')}]" for d in search_results])
        
        # 3. OPTIMIZED ENGLISH PROMPT
        template = f"""
        Role: Friendly Assistant at Veganic Mart 🌿.
        Style: Very brief, concise, and helpful English.
        
        STRICT RULES:
        1. Answer length: Keep responses under 2 sentences. 
        2. Directness: Answer immediately. No filler like "I'm happy to help".
        3. Accuracy: If asked for 'fruit', do NOT list 'juice'. If asked for 'juice', do NOT list 'fruit'.
        4. Lists: Use bullet points for max 3 items.
        
        RECENT CONVERSATION:
        {history_context}
        
        STOCK DATA:
        {product_info}
        
        USER: {request.message}
        ASSISTANT:"""

        ai_answer = llm.invoke(template).strip()

        # 4. STORE HISTORY (Limit to last 3 rounds)
        chat_history[s_id].append(f"User: {request.message}")
        chat_history[s_id].append(f"Bot: {ai_answer}")
        if len(chat_history[s_id]) > 6: 
            chat_history[s_id] = chat_history[s_id][-6:]

        # 5. CARD EXTRACTION (Smart Logic)
        final_products = []
        user_msg_lower = request.message.lower()
        ai_ans_lower = ai_answer.lower()

        print("\n" + "="*50, flush=True)
        for doc in search_results:
            img_url = ""
            if isinstance(doc.get("images"), list) and len(doc["images"]) > 0:
                img_url = doc["images"][0].get("url", "")

            name_lower = doc.get('name', '').lower()
            
            # Logic: Hiện card nếu tên SP xuất hiện trong câu trả lời AI HOẶC tin nhắn User
            if img_url and (name_lower in ai_ans_lower or name_lower in user_msg_lower):
                final_products.append({
                    "id": str(doc["_id"]),
                    "name": doc["name"],
                    "price": doc.get("price", 0),
                    "image": img_url
                })
            print(f"📦 Checking: {doc.get('name')} | Match: {name_lower in ai_ans_lower or name_lower in user_msg_lower}", flush=True)

        print(f"✅ Cards sent: {len(final_products)}", flush=True)
        sys.stdout.flush()

        return {
            "answer": ai_answer, 
            "products": final_products[:3] 
        }

    except Exception as e:
        print(f"❌ ERROR: {e}", flush=True)
        return {"answer": "I'm sorry, I hit a snag. Please ask again! 🌿", "products": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)