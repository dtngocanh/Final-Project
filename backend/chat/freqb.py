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
    print("--- BẮT ĐẦU QUÁ TRÌNH SYNC DỮ LIỆU SIÊU TỐI ƯU RAM (FP-GROWTH) ---")
    
    # Bước 0: Reset dữ liệu cũ
    product_col.update_many({}, {"$unset": {"frequentlyBoughtTogether": ""}})

    # Bước 1: Lấy đơn hàng bằng Cursor (Đọc cuốn chiếu, cực nhẹ RAM)
    order_cursor = order_col.find({}, {"orderItems.name": 1})
    
    raw_transactions = []
    product_stats = {}
    
    for o in order_cursor:
        items = [item['name'] for item in o.get('orderItems', []) if item.get('name')]
        # Chỉ lấy các đơn hàng có từ 2 sản phẩm trở lên để tìm quy luật mua kèm
        if len(items) > 1:
            raw_transactions.append(items)
            for item in items:
                product_stats[item] = product_stats.get(item, 0) + 1
                
    if not raw_transactions:
        print("Không có dữ liệu đơn hàng hợp lệ để phân tích.")
        return

    # Danh sách bán chạy nhất toàn sàn (Global Top) dùng để Fallback
    global_popular = sorted(product_stats.keys(), key=lambda x: product_stats[x], reverse=True)

    # 🌟 CHIẾN THUẬT SIÊU TỐI ƯU: LỌC BỎ SẢN PHẨM RÁC/ÍT BÁN ĐỂ GIẢM SỐ CỘT MA TRẬN
    # Nếu sản phẩm xuất hiện ít hơn 2 lần trên toàn hệ thống, loại bỏ thẳng tay để giảm tải RAM lên tới 80%
    min_item_appearance = 2 
    frequent_products = {items for items, count in product_stats.items() if count >= min_item_appearance}

    filtered_transactions = []
    for t in raw_transactions:
        clean_t = [item for item in t if item in frequent_products]
        if len(clean_t) > 1: # Giữ lại nếu sau khi lọc vẫn còn > 1 sản phẩm mua chung
            filtered_transactions.append(clean_t)

    frequent_map = {} 
    
    if filtered_transactions:
        print(f"Step 1: Analyzing {len(filtered_transactions)} filtered orders with FP-Growth...")
        
        # Biến đổi danh sách thành dạng Series và ép kiểu dữ liệu Sparse tối đa
        s = pd.Series(filtered_transactions)
        df_onehot = pd.get_dummies(s.explode()).groupby(level=0).max().astype(pd.SparseDtype(bool, False))
        
        # Đặt min_support an toàn là 0.02 (2%). Đơn hàng giả lập nhiều cần support cao để tránh bùng nổ tổ hợp luật.
        frequent_itemsets = fpgrowth(df_onehot, min_support=0.02, use_colnames=True)
        
        if not frequent_itemsets.empty:
            # Sinh luật kết hợp với ngưỡng lift=1.0
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            rules = rules.sort_values(by=['lift', 'confidence'], ascending=False)
            
            for _, row in rules.iterrows():
                if len(row['antecedents']) == 1:
                    origin = list(row['antecedents'])[0]
                    target = list(row['consequents'])[0]
                    if origin not in frequent_map: frequent_map[origin] = []
                    if target not in frequent_map[origin] and len(frequent_map[origin]) < 10:
                        frequent_map[origin].append(target)

    # Bước 3: Mapping thông tin sản phẩm (Dùng Cursor)
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
        
        # Ghi cuộn chiếu từng cụm 100 sản phẩm một để xả bớt RAM mạng
        if len(bulk_updates) >= 100:
            product_col.bulk_write(bulk_updates)
            bulk_updates = []

    # Bước 5: Thực thi nốt số còn lại
    if bulk_updates:
        product_col.bulk_write(bulk_updates)
        
    print("--- THÀNH CÔNG HOÀN TOÀN ---")

if __name__ == "__main__":
    sync_recommendations_to_products()