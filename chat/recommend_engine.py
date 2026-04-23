import os
import numpy as np
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

def build_final_recommendations():
    print("🎯 Đang thực thi thuật toán Hybrid Recommendation...")

    # 1. Lấy dữ liệu
    projection = {"_id": 1, "embedding": 1, "category": 1, "salesCount": 1, "viewCount": 1}
    products = list(collection.find({"embedding": {"$exists": True}}, projection))
    
    if not products:
        print("❌ Không có dữ liệu embedding!")
        return

    product_ids = [p['_id'] for p in products]
    embeddings_matrix = np.array([p['embedding'] for p in products])
    
    # 2. Xử lý Popularity Score (Sales + Views)
    # Tránh lỗi nếu các trường này không tồn tại
    stats = []
    for p in products:
        s = p.get('salesCount', 0) if p.get('salesCount') is not None else 0
        v = p.get('viewCount', 0) if p.get('viewCount') is not None else 0
        stats.append([s, v])
    
    stats_matrix = np.array(stats)
    scaler = MinMaxScaler()
    # Chuyển chỉ số về [0, 1] để cộng với điểm Similarity
    normalized_stats = scaler.fit_transform(stats_matrix)
    pop_scores = (normalized_stats[:, 0] * 0.7) + (normalized_stats[:, 1] * 0.3)

    # 3. Tính độ tương đồng Vector
    sim_matrix = cosine_similarity(embeddings_matrix)

    bulk_updates = []

    # 4. Mix các yếu tố lại
    for i in range(len(products)):
        # Điểm gốc từ Vector
        scores = sim_matrix[i]
        
        # Thưởng 50% điểm nếu cùng danh mục
        current_cat = products[i].get('category')
        category_boost = np.array([1.5 if p.get('category') == current_cat else 1.0 for p in products])
        
        # Công thức lai
        final_scores = (scores * category_boost) + (pop_scores * 0.2)
        
        # Loại bỏ chính nó (để không gợi ý chính mình)
        final_scores[i] = -1 

        # Lấy Top 6 thằng điểm cao nhất
        top_indices = np.argsort(final_scores)[::-1][:6]
        related_ids = [str(product_ids[idx]) for idx in top_indices]

        bulk_updates.append(
            UpdateOne(
                {"_id": product_ids[i]},
                {"$set": {"related_product_ids": related_ids}}
            )
        )

    # 5. Lưu vào Database
    if bulk_updates:
        collection.bulk_write(bulk_updates)
        print(f"✅ Đã cập nhật Related Products cho {len(products)} sản phẩm.")

if __name__ == "__main__":
    build_final_recommendations()