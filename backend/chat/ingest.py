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

# 1. TỰ ĐỘNG CHECK MÔI TRƯỜNG (RENDER HOẶC GITHUB ACTIONS)
IS_RENDER = os.getenv("RENDER") is not None
IS_GITHUB_ACTIONS = os.getenv("GITHUB_ACTIONS") is not None

model_offline = None
hf_client = None

# Nếu chạy trên Cloud (Render / GitHub Actions), dùng API Online để tránh cạn kiệt RAM (OOM)
if IS_RENDER or IS_GITHUB_ACTIONS:
    print("[MOI TRUONG CLOUD]: Dung Hugging Face API online de tiet kiem RAM!")
    HF_TOKEN = os.getenv("HF_TOKEN")
    hf_client = InferenceClient(provider="hf-inference", api_key=HF_TOKEN)
    # Ghi đè để hàm get_embedding biết là đang chạy chế độ Online API
    USE_ONLINE_API = True
else:
    print("[MOI TRUONG LOCAL]: Tai model Offline vao RAM!")
    from sentence_transformers import SentenceTransformer
    model_offline = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    USE_ONLINE_API = False

# 2. HÀM EMBEDDING THÔNG MINH
def get_embedding(text: str) -> list:
    try:
        if USE_ONLINE_API:
            # Dùng Hugging Face Serverless API
            vector = hf_client.feature_extraction(text, model="sentence-transformers/all-MiniLM-L6-v2")
            return vector.tolist() if hasattr(vector, "tolist") else vector
        else:
            # Dùng RAM máy local (Chạy Offline)
            return model_offline.encode(text).tolist()
    except Exception as e:
        print(f" -> Lỗi tính toán Vector: {e}")
        return []

# 3. NẠP DỮ LIỆU
def clean_data(value):
    return str(value).strip() if value and str(value).lower() != 'nan' else "N/A"

def start_ingest():
    print("\n--- BẮT ĐẦU NẠP VECTOR ---")
    
    # Chỉ lấy các trường cần thiết, bỏ qua trường 'embedding' cũ để tối ưu bộ nhớ khi query
    products = list(collection.find({}, {"name": 1, "category": 1, "description": 1}))
    total = len(products)
    
    print(f"Tổng số sản phẩm cần quét: {total}")
    bulk_updates = []
    
    for index, item in enumerate(products):
        name = clean_data(item.get('name'))
        category = clean_data(item.get('category'))
        description = clean_data(item.get('description'))
        
        # Tạo chuỗi văn bản ngữ nghĩa để tiến hành nhúng (embed)
        semantic_text = f"Product Name: {name}. Category: {category}. Description: {description}."

        vector = get_embedding(semantic_text)
        if not vector: 
            continue

        bulk_updates.append(
            UpdateOne(
                {"_id": item.get('_id')}, 
                {"$set": {
                    "embedding": vector,             
                    "metadata_text": semantic_text
                }}
            )
        )
        
        # Batch upload - gom đủ 50 sản phẩm thì cập nhật DB một lần để giảm số lần kết nối mạng
        if len(bulk_updates) >= 50:
            collection.bulk_write(bulk_updates)
            bulk_updates = []
            print(f" Đã nạp: {index+1}/{total}")

    # Cập nhật số lượng sản phẩm còn dư lại cuối cùng (nếu có)
    if bulk_updates:
        collection.bulk_write(bulk_updates)
        print(f" Đã nạp: {total}/{total}")
        
    print("\n XONG! Dữ liệu đã sẵn sàng trên MongoDB Atlas.")

if __name__ == "__main__":
    start_ingest()