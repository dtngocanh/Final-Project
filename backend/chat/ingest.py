import os
import re
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from huggingface_hub import InferenceClient

load_dotenv()

# CẤU HÌNH KẾT NỐI
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME", "freshmart")]
collection = db[os.getenv("COLLECTION_NAME", "products")]

# 1. TỰ ĐỘNG CHECK MÔI TRƯỜNG
IS_RENDER = os.getenv("RENDER") is not None
model_offline = None
hf_client = None

if IS_RENDER:
    print("[MOI TRUONG RENDER]: Dung Hugging Face API online de tiet kiem RAM!")
    HF_TOKEN = os.getenv("HF_TOKEN")
    hf_client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)
else:
    print("[MOI TRUONG LOCAL]: Tai model Offline vao RAM!")
    from sentence_transformers import SentenceTransformer
    model_offline = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# 2. HÀM EMBEDDING THÔNG MINH
def get_embedding(text: str) -> list:
    try:
        if IS_RENDER:
            # Dùng Hugging Face API cho server
            vector = hf_client.feature_extraction(text, model="sentence-transformers/all-MiniLM-L6-v2")
            return vector.tolist() if hasattr(vector, "tolist") else vector
        else:
            # Dùng RAM máy local
            return model_offline.encode(text).tolist()
    except Exception as e:
        print(f" -> Lỗi tính toán Vector: {e}")
        return []

# 3. NẠP DỮ LIỆU
def clean_data(value):
    return str(value).strip() if value and str(value).lower() != 'nan' else "N/A"

def start_ingest():
    print("\n--- BẮT ĐẦU NẠP VECTOR ---")
    products = list(collection.find({}, {"embedding": 0}))
    total = len(products)
    
    bulk_updates = []
    for index, item in enumerate(products):
        name = clean_data(item.get('name'))
        semantic_text = f"Product Name: {name}. Category: {clean_data(item.get('category'))}. Description: {clean_data(item.get('description'))}."

        vector = get_embedding(semantic_text)
        if not vector: continue

        bulk_updates.append(
            UpdateOne(
                {"_id": item.get('_id')}, 
                {"$set": {
                    "embedding": vector,             
                    "metadata_text": semantic_text
                }}
            )
        )
        
        # Batch upload
        if len(bulk_updates) >= 50:
            collection.bulk_write(bulk_updates)
            bulk_updates = []
            print(f" Đã nạp: {index+1}/{total}")

    if bulk_updates:
        collection.bulk_write(bulk_updates)
    print("\n XONG! Dữ liệu đã sẵn sàng trên MongoDB Atlas.")

if __name__ == "__main__":
    start_ingest()