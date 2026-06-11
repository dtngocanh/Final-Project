import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from mlxtend.frequent_patterns import fpgrowth, association_rules

# 1. KẾT NỐI
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
order_col = db["orders"]
product_col = db["products"]

def sync_recommendations_to_products():
    print("--- BẮT ĐẦU QUÁ TRÌNH SYNC DỮ LIỆU TỐI ƯU (FP-GROWTH) ---")
    
    # Bước 0: Reset dữ liệu cũ
    product_col.update_many({}, {"$unset": {"frequentlyBoughtTogether": ""}})

    # Bước 1: Lấy đơn hàng bằng Cursor (Giải phóng RAM, không dùng list)
    order_cursor = order_col.find({}, {"orderItems.name": 1})
    
    transactions = []
    product_stats = {}
    
    for o in order_cursor:
        items = [item['name'] for item in o.get('orderItems', []) if item.get('name')]
        if items:
            transactions.append(items)
            for item in items:
                product_stats[item] = product_stats.get(item, 0) + 1
                
    if not transactions:
        print("Không có dữ liệu đơn hàng để xử lý.")
        return

    # Danh sách bán chạy nhất toàn sàn (Global Top)
    global_popular = sorted(product_stats.keys(), key=lambda x: product_stats[x], reverse=True)

    # Bước 2: Chạy FP-Growth với cơ chế Tiết kiệm Bộ nhớ (Sparse Data)
    multi_item_tx = [t for t in transactions if len(t) > 1]
    frequent_map = {} 
    
    if multi_item_tx:
        print("Step 1: Analyzing orders with FP-Growth (Memory Optimized)...")
        
        # GIẢI PHÁP THAY THẾ TRANSACTIONENCODER NẶNG NỀ:
        # Sử dụng thuộc tính explode kết hợp get_dummies và ép kiểu dữ liệu về 'Sparse[bool]'
        s = pd.Series(multi_item_tx)
        df_onehot = pd.get_dummies(s.explode()).groupby(level=0).max().astype(pd.SparseDtype(bool, False))
        
        # Nâng nhẹ min_support từ 0.005 lên 0.01 (1%) giúp thuật toán chạy nhanh và lọc nhiễu tốt hơn hẳn
        frequent_itemsets = fpgrowth(df_onehot, min_support=0.01, use_colnames=True)
        
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            rules = rules.sort_values(by=['lift', 'confidence'], ascending=False)
            
            for _, row in rules.iterrows():
                if len(row['antecedents']) == 1:
                    origin = list(row['antecedents'])[0]
                    target = list(row['consequents'])[0]
                    if origin not in frequent_map: frequent_map[origin] = []
                    if target not in frequent_map[origin] and len(frequent_map[origin]) < 10:
                        frequent_map[origin].append(target)

    # Bước 3: Mapping thông tin sản phẩm (Sử dụng Cursor)
    product_cursor = product_col.find({}, {"_id": 1, "name": 1, "category": 1, "image": 1, "images": 1, "price": 1})
    
    def get_first_image(p):
        imgs = p.get('images') or p.get('image') or []
        if isinstance(imgs, list) and len(imgs) > 0: return imgs[0]
        if isinstance(imgs, str) and imgs != "": return imgs
        return ""

    info_lookup = {}
    cat_map = {}
    all_products_minimal = []

    for p in product_cursor:
        p_name = p['name']
        p_cat = p.get('category', 'Uncategorized')
        
        info_lookup[p_name] = {
            "id": p['_id'], 
            "image": get_first_image(p),
            "price": p.get('price', 0)
        }
        
        if p_cat not in cat_map: 
            cat_map[p_cat] = []
        cat_map[p_cat].append(p_name)
        
        all_products_minimal.append({"_id": p['_id'], "name": p_name, "category": p_cat})
    
    for cat in cat_map:
        cat_map[cat].sort(key=lambda x: product_stats.get(x, 0), reverse=True)

    # Bước 4: Tạo danh sách Update với Logic 3 lớp
    print("Step 2: Building refined recommendation sets...")
    bulk_updates = []
    
    for p in all_products_minimal:
        p_name = p['name']
        final_names = []

        # Lớp 1: FP-Growth
        if p_name in frequent_map:
            final_names.extend([name for name in frequent_map[p_name] if name in info_lookup])

        # Lớp 2: Fallback Category
        if len(final_names) < 4:
            cat_fallbacks = cat_map.get(p['category'], [])
            for f_name in cat_fallbacks:
                if f_name != p_name and f_name not in final_names:
                    final_names.append(f_name)
                if len(final_names) >= 6: break

        # Lớp 3: Fallback Global Top
        if len(final_names) < 4:
            for g_name in global_popular:
                if g_name != p_name and g_name not in final_names and g_name in info_lookup:
                    final_names.append(g_name)
                if len(final_names) >= 4: break

        # Format kết quả
        formatted_list = []
        for n in final_names[:4]:
            info = info_lookup[n]
            formatted_list.append({
                "productId": info["id"],
                "name": n,
                "image": info["image"],
                "price": info["price"]
            })

        bulk_updates.append(UpdateOne(
            {"_id": p['_id']}, 
            {"$set": {"frequentlyBoughtTogether": formatted_list}}
        ))
        
        # Batch write cụm 200 sản phẩm một để tránh quá tải RAM mạng
        if len(bulk_updates) >= 200:
            product_col.bulk_write(bulk_updates)
            bulk_updates = []

    # Bước 5: Ghi nốt phần còn dư vào DB
    if bulk_updates:
        product_col.bulk_write(bulk_updates)
        
    print("--- THÀNH CÔNG HOÀN TOÀN ---")

if __name__ == "__main__":
    sync_recommendations_to_products()