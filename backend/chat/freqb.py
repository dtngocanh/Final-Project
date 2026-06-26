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
    print(" LỖI: Chưa cấu hình MONGO_URI hoặc DB_NAME trong file .env!")
    sys.exit(1)

client = MongoClient(uri)
db = client[db_name]
order_col = db["orders"]
product_col = db["products"]

def sync_recommendations_to_products():
    print("==============================================================")
    print(" BẮT ĐẦU TIẾN TRÌNH SYNC GỢI Ý SIÊU TỐC - CHỐNG TREO TUYỆT ĐỐI")
    print("==============================================================")
    
    # ------------------------------------------------------------
    # BƯỚC 0: TỰ ĐỘNG KIỂM TRA & TẠO INDEX (CHỐNG NGHẼN DATABASE CHÍ MẠNG)
    # ------------------------------------------------------------
    print("[0/5] Kiểm tra chỉ mục (Indexes) để tối ưu hóa truy vấn...")
    order_col.create_index([("orderItems.name", 1)], background=True)
    order_col.create_index([("orderItems.1", 1)], background=True)
    
    print(" Đang dọn dẹp dữ liệu gợi ý cũ...")
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
        print(" Không tìm thấy dữ liệu đơn hàng hợp lệ.")
        return

    print(f" Tìm thấy tổng cộng {len(product_stats)} sản phẩm khác nhau trên toàn sàn.")
    global_popular = list(product_stats.keys())
    
    # LỌC BỎ SẢN PHẨM RÁC/HIẾM: Nâng lên 3 lần xuất hiện để dọn dẹp bộ nhớ ma trận
    MIN_ITEM_APPEARANCE = 3 
    frequent_products = {name for name, count in product_stats.items() if count >= MIN_ITEM_APPEARANCE}
    print(f" Giữ lại {len(frequent_products)} sản phẩm phổ biến (xuất hiện >= {MIN_ITEM_APPEARANCE} lần).")

    # ------------------------------------------------------------
    # BƯỚC 2: STREAMING ĐƠN HÀNG VÀ CHẠY FP-GROWTH
    # ------------------------------------------------------------
    print("\n[2/5] Step 1.2: Đang tải danh sách đơn hàng về bộ nhớ...")
    order_cursor = order_col.find({"orderItems.1": {"$exists": True}}, {"orderItems.name": 1})
    
    filtered_transactions = []
    count_orders = 0
    
    for o in order_cursor:
        count_orders += 1
        if count_orders % 2000 == 0:
            print(f"    Đã quét qua {count_orders} đơn hàng...")
            
        clean_t = [item['name'] for item in o.get('orderItems', []) if item.get('name') in frequent_products]
        if len(clean_t) > 1:
            filtered_transactions.append(clean_t)
            
    order_cursor.close()
    print(f" Tải xong. Có {len(filtered_transactions)} đơn hàng hợp lệ đưa vào AI training.")

    frequent_map = {} 
    if filtered_transactions:
        MIN_SUPPORT = 0.04 
        print(f"\n[3/5] Step 1.3: Đang huấn luyện mô hình FP-Growth (min_support={MIN_SUPPORT})...")
        
        te = TransactionEncoder()
        te_ary = te.fit(filtered_transactions).transform(filtered_transactions, sparse=True)
        df_onehot = pd.DataFrame.sparse.from_spmatrix(te_ary, columns=te.columns_)
        df_onehot = df_onehot.astype(pd.SparseDtype(bool, False))
        
        del filtered_transactions, te_ary
        
        frequent_itemsets = fpgrowth(df_onehot, min_support=MIN_SUPPORT, use_colnames=True)
        print(f"    Đã tạo ra {len(frequent_itemsets)} tập phổ biến.")
        
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            MIN_CONFIDENCE = 0.4
            rules = rules[rules["confidence"] >= MIN_CONFIDENCE]
            rules = rules.sort_values(by=["lift", "confidence"], ascending=False)

            print("\n" + "=" * 120 + "\n TOP 100 FP-GROWTH RULES\n" + "=" * 120)
            single_rules = rules[(rules["antecedents"].apply(len) == 1) & (rules["consequents"].apply(len) == 1)]

            for _, row in single_rules.head(100).iterrows():
                antecedent = list(row["antecedents"])[0]
                consequent = list(row["consequents"])[0]
                print(f"{antecedent:<40} -> {consequent:<40}| support={row['support']:.3f} | confidence={row['confidence']:.3f} | lift={row['lift']:.3f}")

            print("=" * 120)
            print(f" Tổng số rule tìm được: {len(rules)}")
            print(f" Rule 1→1 tìm được: {len(single_rules)}")
            print("=" * 120)

            for row in rules.itertuples():
                antecedents = list(row.antecedents)
                consequents = list(row.consequents)

                if len(antecedents) != 1:
                    continue

                origin = antecedents[0]
                if origin not in frequent_map:
                    frequent_map[origin] = []

                for target in consequents:
                    if target == origin:
                        continue
                    if target not in frequent_map[origin]:
                        frequent_map[origin].append(target)
                    if len(frequent_map[origin]) >= 10:
                        break
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

    for cat in cat_map:
        cat_map[cat].sort(key=lambda x: product_stats.get(x, 0), reverse=True)

    # ------------------------------------------------------------
    # BƯỚC 4: TÍNH TOÁN GỢI Ý 3 LỚP & ĐẨY KHỐI SONG SONG (BULK WRITE)
    # ------------------------------------------------------------
    print("\n[5/5] Step 2.2: Đang ráp thuật toán 3 lớp & Đẩy dữ liệu mới vào MongoDB...")
    bulk_updates = []
    total_processed = 0
    
    # Khởi tạo các biến thống kê tổng quan ở cuối tiến trình
    total_l1, total_l2, total_l3 = 0, 0, 0

    for p in all_products_minimal:
        p_name = p['name']
        final_names = []
        seen = {p_name} 
        
        # Mảng lưu vết log xem item được gợi ý đến từ layer nào
        debug_layers = []

        # Lớp 1: Lấy từ kết quả AI FP-Growth mua kèm nhiều nhất
        if p_name in frequent_map:
            for name in frequent_map[p_name]:
                if name in info_lookup and name not in seen:
                    final_names.append(name)
                    seen.add(name)
                    debug_layers.append(f"'{name}' (L1: FP-Growth)")
                    total_l1 += 1
                    if len(final_names) >= 4: break

        # Lớp 2: Fallback - Lấy sản phẩm cùng Danh mục (Category) bán chạy nhất
        if len(final_names) < 4:
            for f_name in cat_map.get(p['category'], []):
                if f_name not in seen and f_name in info_lookup:
                    final_names.append(f_name)
                    seen.add(f_name)
                    debug_layers.append(f"'{f_name}' (L2: Category Hot)")
                    total_l2 += 1
                    if len(final_names) >= 4: break

        # Lớp 3: Fallback - Lấy Top sản phẩm bán chạy nhất toàn sàn hệ thống
        if len(final_names) < 4:
            for g_name in global_popular:
                if g_name not in seen and g_name in info_lookup:
                    final_names.append(g_name)
                    seen.add(g_name)
                    debug_layers.append(f"'{g_name}' (L3: Global Hot)")
                    total_l3 += 1
                    if len(final_names) >= 4: break

        # --- LOG CHI TIẾT SẢN PHẨM RA MÀN HÌNH ---
        print(f" Sản phẩm: [{p_name}] -> Gợi ý: [{', '.join(debug_layers)}]")

        formatted_list = [
            {
                "productId": info_lookup[n]["id"],
                "name": n,
                "image": info_lookup[n]["image"],
                "price": info_lookup[n]["price"]
            }
            # Cắt mảng lấy 4 phần tử (Đảm bảo an toàn logic gốc)
            for n in final_names[:4] 
        ]

        bulk_updates.append(UpdateOne(
            {"_id": p['_id']}, 
            {"$set": {"frequentlyBoughtTogether": formatted_list}}
        ))
        
        if len(bulk_updates) >= 200:
            product_col.bulk_write(bulk_updates, ordered=False)
            total_processed += len(bulk_updates)
            print(f"\n--- [BULK WRITE] Đã lưu thành công bộ gợi ý cho {total_processed} sản phẩm ---\n")
            bulk_updates = []

    if bulk_updates:
        product_col.bulk_write(bulk_updates, ordered=False)
        total_processed += len(bulk_updates)
        
    print("\n==============================================================")
    print(f" THÀNH CÔNG RỰC RỠ! Đã xử lý & đồng bộ {total_processed} sản phẩm.")
    print(" THỐNG KÊ CHI TIẾT ĐỘ PHỦ LAYER:")
    print(f"  - Số item gợi ý sinh ra từ L1 (FP-Growth)   : {total_l1}")
    print(f"  - Số item gợi ý sinh ra từ L2 (Category Hot) : {total_l2}")
    print(f"  - Số item gợi ý sinh ra từ L3 (Global Hot)   : {total_l3}")
    print("==============================================================")

if __name__ == "__main__":
    sync_recommendations_to_products()