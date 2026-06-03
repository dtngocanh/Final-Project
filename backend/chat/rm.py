# import os
# from dotenv import load_dotenv
# from pymongo import MongoClient

# # 1. CẤU HÌNH KẾT NỐI
# load_dotenv()
# client = MongoClient(os.getenv("MONGO_URI"))
# db = client[os.getenv("DB_NAME")]
# collection = db[os.getenv("COLLECTION_NAME")]

# def remove_related_products_field():
#     print("--- Bắt đầu xóa trường 'related_product_ids' ---")

#     # 2. SỬ DỤNG $unset ĐỂ XÓA FIELD
#     # {} : Áp dụng cho tất cả document trong collection
#     # {"$unset": {"field_name": ""}} : Lệnh xóa field cụ thể
#     result = collection.update_many(
#         {"related_product_ids": {"$exists": True}}, # Chỉ tìm những máy có trường này để xóa
#         {"$unset": {
#             "related_product_ids": "", 
#             "recommender_updated_at": "" # Xóa luôn cả cái tag ngày cập nhật cho sạch
#         }}
#     )

#     print(f" Kết quả: Đã cập nhật {result.modified_count} sản phẩm.")
#     print(" Xong rồi ní ơi! Dữ liệu đã sạch sẽ như chưa từng có cuộc chia ly.")

# if __name__ == "__main__":
#     # Hỏi xác nhận trước khi chạy cho chắc ăn
#     confirm = input("Bạn có chắc chắn muốn XÓA trường liên quan của tất cả sản phẩm? (y/n): ")
#     if confirm.lower() == 'y':
#         remove_related_products_field()
#     else:
#         print("Đã hủy thao tác.")

import os
from dotenv import load_dotenv
from pymongo import MongoClient

# --- CẤU HÌNH KẾT NỐI ---
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

# Giả sử collection của bạn tên là 'users'
user_col = db["users"] 

def cleanup_personalized_recs():
    print("--- Đang bắt đầu dọn dẹp trường 'personalizedRecs' ---")
    
    # Sử dụng toán tử $unset để xóa bỏ hoàn toàn một trường khỏi document
    result = user_col.update_many(
        {"personalizedRecs": {"$exists": True}}, # Chỉ tìm những user nào có trường này
        {"$unset": {"personalizedRecs": ""}}      # Xóa nó đi
    )
    
    print(f" Đã dọn dẹp xong!")
    print(f" Số lượng user đã được cập nhật: {result.modified_count}")

if __name__ == "__main__":
    cleanup_personalized_recs()