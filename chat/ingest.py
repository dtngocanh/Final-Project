import os
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from langchain_ollama import OllamaEmbeddings

# 1. LOAD CONFIG
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
collection = client[os.getenv("DB_NAME")][os.getenv("COLLECTION_NAME")]
embeddings = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL"))

def clean_data(value):
    if value is None or str(value).lower() == 'nan':
        return "N/A"
    return str(value).strip()

def start_ingest():
    print("🚀 Đang lấy dữ liệu từ MongoDB...")
    # Lấy tất cả sản phẩm, nhưng không lấy field embedding cũ để đỡ nặng RAM
    products = list(collection.find({}, {"embedding": 0}))
    total = len(products)
    
    bulk_updates = []
    
    for index, item in enumerate(products):
        # Lấy ID gốc của sản phẩm
        p_id = item.get('_id')
        name = clean_data(item.get('name'))
        price = item.get('price', 0)
        cat = clean_data(item.get('category'))
        sub_cat = clean_data(item.get('subcategory'))
        stock = item.get('stock', 0)
        desc = clean_data(item.get('description'))
        
        # Xử lý ảnh nhanh
        img_url = item.get('images[0].url')
        if not img_url:
            imgs = item.get('images', [])
            img_url = imgs[0].get('url', 'N/A') if imgs and isinstance(imgs, list) else 'N/A'

        # 2. TẠO NỘI DUNG ĐỂ AI ĐỌC (Metadata Text)
        full_text_en = (
            f"Product ID: {p_id}\n" # Gắn ID vào đầu chuỗi nếu ông muốn AI "thấy" luôn
            f"Name: {name}. Category: {cat} > {sub_cat}.\n"
            f"Price: {price} $. Stock: {stock}.\n"
            f"Description: {desc}\n"
            f"Image: {img_url}"
        )

        try:
            # 3. TẠO VECTOR
            vector = embeddings.embed_query(full_text_en)
            
            # Dùng UpdateOne để ghi đè/thêm mới field embedding và metadata_text vào đúng ID đó
            bulk_updates.append(
                UpdateOne(
                    {"_id": p_id}, 
                    {"$set": {
                        "embedding": vector, 
                        "metadata_text": full_text_en,
                        "ingested_id": str(p_id) # Lưu thêm một bản string ID để search cho dễ
                    }}
                )
            )
            
            if len(bulk_updates) >= 50: # Cứ 50 sản phẩm thì đẩy lên DB một lần cho nhanh
                collection.bulk_write(bulk_updates)
                bulk_updates = []
                print(f"✅ Đã nạp: {index+1}/{total}")

        except Exception as e:
            print(f"❌ Lỗi tại sản phẩm {name}: {e}")

    # Nạp nốt số còn lại
    if bulk_updates:
        collection.bulk_write(bulk_updates)
            
    print("\n✨ INGESTION XONG RỒI! Giờ search cái là ra ID luôn.")

if __name__ == "__main__":
    start_ingest()