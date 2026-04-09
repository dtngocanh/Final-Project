import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from langchain_ollama import OllamaEmbeddings, OllamaLLM
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. LOAD BIẾN MÔI TRƯỜNG
load_dotenv()

def get_env_or_fail(key, default=None):
    value = os.getenv(key, default)
    if value is None:
        raise ValueError(f"CRITICAL ERROR: Missing '{key}' in .env file")
    return value

try:
    MONGO_URI = get_env_or_fail("MONGO_URI")
    DB_NAME = get_env_or_fail("DB_NAME")
    COLLECTION_NAME = get_env_or_fail("COLLECTION_NAME")
    EMBEDDING_MODEL = get_env_or_fail("EMBEDDING_MODEL")
    LLM_MODEL = get_env_or_fail("LLM_MODEL")
    PORT = int(os.getenv("PORT", 8000))
except ValueError as e:
    print(e)
    exit(1)

app = FastAPI(title="Veganic Mart AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. KẾT NỐI DB VÀ CẤU HÌNH AI
client = MongoClient(MONGO_URI)
collection = client[DB_NAME][COLLECTION_NAME]
embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)
# Giảm temperature xuống 0 để AI trả về JSON chuẩn xác nhất, không nói nhảm
llm = OllamaLLM(model=LLM_MODEL, temperature=0)

chat_histories = {}

class ChatRequest(BaseModel):
    message: str
    session_id: str = "user_default"

def vector_search(user_query):
    try:
        query_vector = embeddings.embed_query(user_query)
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 100,
                    "limit": 4 
                }
            },
            {
                # SỬA Ở ĐÂY: Lấy thêm ID và các thông tin gốc
                "$project": {
                    "_id": 1, 
                    "name": 1,
                    "price": 1,
                    "description": 1,
                    "metadata_text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        results = list(collection.aggregate(pipeline))
        
        # Biến đổi kết quả thành chuỗi có kèm ID rõ ràng cho AI đọc
        formatted_docs = []
        for doc in results:
            p_id = str(doc.get("_id"))
            text = doc.get("metadata_text", "")
            # Ép AI biết ID này thuộc về text này
            formatted_docs.append(f"[PRODUCT_ID: {p_id}]\n{text}")
            
        return formatted_docs
    except Exception as e:
        print(f"Vector Search Error: {e}")
        return []

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        sid = request.session_id
        if sid not in chat_histories:
            chat_histories[sid] = []
        
        recent_history = chat_histories[sid][-6:]
        docs = vector_search(request.message)
        context = "\n---\n".join(docs) if docs else "No specific products found."

        history_text = ""
        for msg in recent_history:
            role = "Customer" if msg['role'] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"

        # 4. PROMPT ÉP AI TRẢ VỀ JSON ĐỂ FRONTEND RENDER CARD
        # 4. PROMPT ÉP AI SỬ DỤNG ID LÀM ĐƯỜNG DẪN (SLUG)
        template = f"""
You are an expert sales assistant at Veganic Mart. 
Response MUST be a single JSON object. DO NOT include any text before or after the JSON.

### RESPONSE FORMAT:
{{
  "answer": "Your friendly message here",
  "products": [
    {{
      "id": "exact_id_from_context",
      "name": "Product Name",
      "price": 0.0,
      "image": "image_url",
      "slug": "MUST_BE_THE_SAME_AS_ID"
    }}
  ]
}}

### STRICT RULES FOR IDS AND LINKS:
1. For the "id" field, use the exact alphanumeric string found in [PRODUCT_ID: ...].
2. For the "slug" field, you MUST copy the exact same value as the "id". 
   - Example: If ID is "69c8c7417f5bdbacef642048", then slug MUST BE "69c8c7417f5bdbacef642048".
3. DO NOT create SEO-friendly words like 'fresh-apple' for the slug. Only use the MongoDB ID.
4. The "answer" must be in English.

### CONTEXT:
{context}

### CHAT HISTORY:
{history_text}

### CUSTOMER'S MESSAGE:
{request.message}
"""

        # 5. Gọi AI và Parse JSON
        raw_response = llm.invoke(template).strip()
        
        try:
            # Tìm và cắt phần JSON trong trường hợp AI trả về thừa chữ
            start_idx = raw_response.find('{')
            end_idx = raw_response.rfind('}') + 1
            data = json.loads(raw_response[start_idx:end_idx])
            
            final_answer = data.get("answer", "")
            found_products = data.get("products", [])
        except:
            # Fallback nếu AI lỗi JSON
            final_answer = raw_response
            found_products = []

        # 6. Cập nhật lịch sử hội thoại
        chat_histories[sid].append({"role": "user", "content": request.message})
        chat_histories[sid].append({"role": "assistant", "content": final_answer})

        return {
            "answer": final_answer,
            "products": found_products, # Trả về mảng sp cho React map()
            "session_id": sid
        }

    except Exception as e:
        print(f"Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)