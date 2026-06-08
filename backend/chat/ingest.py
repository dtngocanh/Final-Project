import os
import time
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
# BƯỚC KHỞI ĐẦU: Nhớ chạy lệnh 'pip install sentence-transformers' ở terminal trước nhé
from sentence_transformers import SentenceTransformer 

# =====================================================
# 1. LOAD CONFIG & KHỞI TẠO MODEL OFFLINE
# =====================================================
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
collection = client[os.getenv("DB_NAME")][os.getenv("COLLECTION_NAME")]

print("--- KHỞI TẠO MODEL OFFLINE (BẤT CHẤP LỖI MẠNG) ---")
# Tải model về máy local (Chỉ tốn vài giây ở lần đầu tiên, từ lần sau chạy là ăn ngay)
# Vẫn giữ nguyên chuẩn model 384 chiều để khớp 100% với file chat_api.py của bạn
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("Model đã load xong vào RAM! Sẵn sàng chiến đấu.")

def clean_data(value):
    if value is None or str(value).lower() == 'nan':
        return "N/A"
    return str(value).strip()

def get_local_embedding(text: str) -> list:
    """Chạy trực tiếp trên CPU/RAM máy bạn, không thèm gọi API qua Internet"""
    try:
        # Chuyển văn bản thành numpy array rồi ép sang mảng số list thường để nạp vào Mongo
        vector_np = model.encode(text)
        return vector_np.tolist()
    except Exception as e:
        print(f" -> Lỗi tính toán Vector: {e}")
    return []

# =====================================================
# 2. START INGESTION
# =====================================================
def start_ingest():
    print("\n--- BẮT ĐẦU NẠP VECTOR OFFLINE ---")
    print("Đang quét dữ liệu từ MongoDB...")
    
    # Lấy tất cả sản phẩm, loại bỏ field embedding cũ để nhẹ RAM
    products = list(collection.find({}, {"embedding": 0}))
    total = len(products)
    print(f"Tìm thấy tổng cộng: {total} sản phẩm.")
    
    bulk_updates = []
    
    for index, item in enumerate(products):
        p_id = item.get('_id')
        name = clean_data(item.get('name'))
        cat = clean_data(item.get('category'))
        sub_cat = clean_data(item.get('subcategory'))
        desc = clean_data(item.get('description'))

        # Chuỗi text sạch để AI hiểu bản chất sản phẩm
        semantic_text = f"Product Name: {name}. Category: {cat} > {sub_cat}. Description: {desc}."

        try:
            # Tạo Vector offline cực nhanh
            vector = get_local_embedding(semantic_text)
            
            if not vector:
                print(f"  [Bỏ qua] Không lấy được vector cho sản phẩm: {name}")
                continue

            # Chuẩn bị lệnh cập nhật vào MongoDB Atlas
            bulk_updates.append(
                UpdateOne(
                    {"_id": p_id}, 
                    {"$set": {
                        "embedding": vector,             # Vector 384 chiều chuẩn đét
                        "metadata_text": semantic_text,   
                        "ingested_id": str(p_id)
                    }}
                )
            )
            
            # Vì chạy offline không sợ bị bóp băng thông (Rate Limit), tăng luôn batch lên 50 cho nhanh
            if len(bulk_updates) >= 50:
                collection.bulk_write(bulk_updates)
                bulk_updates = []
                print(f" Đã nạp thành công: {index+1}/{total} sản phẩm")
                # XÓA BỎ lệnh time.sleep(1), cho code chạy hết công suất!

        except Exception as e:
            print(f"  Lỗi tại sản phẩm {name}: {e}")

    # Nạp nốt số sản phẩm còn dư lại
    if bulk_updates:
        collection.bulk_write(bulk_updates)
            
    print("\n  INGESTION XONG RỒI! 302 sản phẩm đã có Vector mượt mà trên MongoDB Atlas!")

if __name__ == "__main__":
    start_ingest()