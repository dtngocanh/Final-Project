import os
import sys
import warnings
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from mlxtend.frequent_patterns import fpgrowth, association_rules
from mlxtend.preprocessing import TransactionEncoder

# Tắt các cảnh báo phiền phức để màn hình log sạch sẽ
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# 1. KẾT NỐI DATABASE
load_dotenv()
uri = os.getenv("MONGO_URI")
db_name = os.getenv("DB_NAME")

if not uri or not db_name:
    print("❌ LỖI: Chưa cấu hình MONGO_URI hoặc DB_NAME trong file .env!")
    sys.exit(1)

client = MongoClient(uri)
db = client[db_name]
order_col = db["orders"]
product_col = db["products"]

def sync_recommendations_to_products():
    print("==============================================================")
    print("🚀 BẮT ĐẦU TIẾN TRÌNH SYNC GỢI Ý SIÊU TỐC - CHỐNG TREO TUYỆT ĐỐI")
    print("==============================================================")
    
    # ------------------------------------------------------------
    # BƯỚC 0: TỰ ĐỘNG KIỂM TRA & TẠO INDEX (CHỐNG NGHẼN DATABASE CHÍ MẠNG)
    # ------------------------------------------------------------
    print("[0/5] Kiểm tra chỉ mục (Indexes) để tối ưu hóa truy vấn...")
    order_col.create_index([("orderItems.name", 1)], background=True)
    order_col.create_index([("orderItems.1", 1)], background=True)
    
    print("🧹 Đang dọn dẹp dữ liệu gợi ý cũ...")
    product_col.update_many({}, {"$unset": {"frequentlyBoughtTogether": ""}})

    # ------------------------------------------------------------
    # BƯỚC 1: ĐẾM TẦN SUẤT SẢN PHẨM QUA MONGODB AGGREGATION
    # ------------------------------------------------------------
    print("\n[1/5] Step 1.1: Đang gom nhóm & đếm tần suất sản phẩm từ DB...")
    pipeline = [
        {"$unwind": "$orderItems"},
        {"$match": {"orderItems.name": {"$ne": None, "$ne": ""}}},
        {"$group": {"_id": "$orderItems.name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    product_stats = {doc["_id"]: doc["count"] for doc in order_col.aggregate(pipeline)}
    
    if not product_stats:
        print("❌ Không tìm thấy dữ liệu đơn hàng hợp lệ.")
        return

    print(f"👉 Tìm thấy tổng cộng {len(product_stats)} sản phẩm khác nhau trên toàn sàn.")
    global_popular = list(product_stats.keys())
    
    # LỌC BỎ SẢN PHẨM RÁC/HIẾM: Nâng lên 3 lần xuất hiện để dọn dẹp bộ nhớ ma trận
    MIN_ITEM_APPEARANCE = 3 
    frequent_products = {name for name, count in product_stats.items() if count >= MIN_ITEM_APPEARANCE}
    print(f"👉 Giữ lại {len(frequent_products)} sản phẩm phổ biến (xuất hiện >= {MIN_ITEM_APPEARANCE} lần).")

    # ------------------------------------------------------------
    # BƯỚC 2: STREAMING ĐƠN HÀNG VÀ CHẠY FP-GROWTH
    # ------------------------------------------------------------
    print("\n[2/5] Step 1.2: Đang tải danh sách đơn hàng về bộ nhớ...")
    # Chỉ lôi các đơn có từ 2 mặt hàng trở lên
    order_cursor = order_col.find({"orderItems.1": {"$exists": True}}, {"orderItems.name": 1})
    
    filtered_transactions = []
    count_orders = 0
    
    for o in order_cursor:
        count_orders += 1
        if count_orders % 2000 == 0:
            print(f"   ⚡ Đã quét qua {count_orders} đơn hàng...")
            
        clean_t = [item['name'] for item in o.get('orderItems', []) if item.get('name') in frequent_products]
        if len(clean_t) > 1:
            filtered_transactions.append(clean_t)
            
    order_cursor.close()
    print(f"✅ Tải xong. Có {len(filtered_transactions)} đơn hàng hợp lệ đưa vào AI training.")

    frequent_map = {} 
    if filtered_transactions:
        # TĂNG MIN_SUPPORT LÊN 0.04 (4%) ĐỂ KIỂM SOÁT TỐC ĐỘ, TRÁNH BÙNG NỔ TỔ HỢP GÂY ĐƠ MÁY
        MIN_SUPPORT = 0.04 
        print(f"\n[3/5] Step 1.3: Đang huấn luyện mô hình FP-Growth (min_support={MIN_SUPPORT})...")
        
        te = TransactionEncoder()
        te_ary = te.fit(filtered_transactions).transform(filtered_transactions, sparse=True)
        df_onehot = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
        df_onehot = df_onehot.astype(pd.SparseDtype(bool, False)) # Ép chặt bit chống tràn RAM
        
        del filtered_transactions, te_ary # Giải phóng RAM ngay tức khắc
        
        frequent_itemsets = fpgrowth(df_onehot, min_support=MIN_SUPPORT, use_colnames=True)
        print(f"   📈 Đã tạo ra {len(frequent_itemsets)} tập phổ biến.")
        
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            rules = rules.sort_values(by=['lift', 'confidence'], ascending=False)
            
            # Khớp quy luật nhanh bằng itertuples
            for row in rules[['antecedents', 'consequents']].itertuples(index=False):
                if len(row.antecedents) == 1:
                    origin = next(iter(row.antecedents))
                    target = next(iter(row.consequents))
                    
                    if origin not in frequent_map: 
                        frequent_map[origin] = []
                    if target not in frequent_map[origin] and len(frequent_map[origin]) < 10:
                        frequent_map[origin].append(target)
        del df_onehot

    # ------------------------------------------------------------
    # BƯỚC 3: MAPPING THÔNG TIN SẢN PHẨM TRÊN RAM (O(1) LOOKUP)
    # ------------------------------------------------------------
    print("\n[4/5] Step 2.1: Đang nạp danh mục thông tin sản phẩm...")
    product_cursor = product_col.find({}, {"_id": 1, "name": 1, "category": 1, "image": 1, "images": 1, "price": 1})
    
    info_lookup = {}
    cat_map = {}
    all_products_minimal = []

    for p in product_cursor:
        p_name = p['name']
        p_cat = p.get('category', 'Uncategorized')
        
        imgs = p.get('images') or p.get('image') or []
        img_url = imgs[0] if isinstance(imgs, list) and imgs else (imgs if isinstance(imgs, str) else "")
        
        info_lookup[p_name] = {
            "id": p['_id'], 
            "image": img_url,
            "price": p.get('price', 0)
        }
        
        if p_cat not in cat_map: 
            cat_map[p_cat] = []
        cat_map[p_cat].append(p_name)
        
        all_products_minimal.append({"_id": p['_id'], "name": p_name, "category": p_cat})
    
    product_cursor.close()

    # Sắp xếp danh mục sẵn theo độ hot để fallback tức thời
    for cat in cat_map:
        cat_map[cat].sort(key=lambda x: product_stats.get(x, 0), reverse=True)

    # ------------------------------------------------------------
    # BƯỚC 4: TÍNH TOÁN GỢI Ý 3 LỚP & ĐẨY KHỐI SONG SONG (BULK WRITE)
    # ------------------------------------------------------------
    print("\n[5/5] Step 2.2: Đang ráp thuật toán 3 lớp & Đẩy dữ liệu mới vào MongoDB...")
    bulk_updates = []
    total_processed = 0
    
    for p in all_products_minimal:
        p_name = p['name']
        final_names = []
        seen = {p_name} 

        # Lớp 1: Lấy từ kết quả AI FP-Growth mua kèm nhiều nhất
        if p_name in frequent_map:
            for name in frequent_map[p_name]:
                if name in info_lookup and name not in seen:
                    final_names.append(name)
                    seen.add(name)
                    if len(final_names) >= 4: break

        # Lớp 2: Fallback - Lấy sản phẩm cùng Danh mục (Category) bán chạy nhất
        if len(final_names) < 4:
            for f_name in cat_map.get(p['category'], []):
                if f_name not in seen and f_name in info_lookup:
                    final_names.append(f_name)
                    seen.add(f_name)
                    if len(final_names) >= 4: break

        # Lớp 3: Fallback - Lấy Top sản phẩm bán chạy nhất toàn sàn hệ thống
        if len(final_names) < 4:
            for g_name in global_popular:
                if g_name not in seen and g_name in info_lookup:
                    final_names.append(g_name)
                    seen.add(g_name)
                    if len(final_names) >= 4: break

        # Ép cấu trúc mảng JSON chuẩn để hiển thị FE công nghệ đẹp mắt
        formatted_list = [
            {
                "productId": info_lookup[n]["id"],
                "name": n,
                "image": info_lookup[n]["image"],
                "price": info_lookup[n]["price"]
            }
            for n in final_names[:4]
        ]

        bulk_updates.append(UpdateOne(
            {"_id": p['_id']}, 
            {"$set": {"frequentlyBoughtTogether": formatted_list}}
        ))
        
        # Đóng gói 200 bản ghi gửi đi một lần (Phù hợp cả Local lẫn Cloud Atlas)
        if len(bulk_updates) >= 200:
            product_col.bulk_write(bulk_updates, ordered=False)
            total_processed += len(bulk_updates)
            print(f"   💾 Đã lưu thành công bộ gợi ý cho {total_processed} sản phẩm...")
            bulk_updates = []

    # Ghi nốt phần dư thừa còn lại
    if bulk_updates:
        product_col.bulk_write(bulk_updates, ordered=False)
        total_processed += len(bulk_updates)
        
    print(f"\n✨ THÀNH CÔNG RỰC RỠ! Đã xử lý & đồng bộ {total_processed} sản phẩm.")
    print("==============================================================")

if __name__ == "__main__":
    sync_recommendations_to_products()