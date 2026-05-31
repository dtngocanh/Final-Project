import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

# 1. KẾT NỐI
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
order_col = db["orders"]
product_col = db["products"]

def sync_recommendations_to_products():
    print("--- BẮT ĐẦU QUÁ TRÌNH SYNC DỮ LIỆU TỐI ƯU ---")
    
    # Bước 0: Reset dữ liệu cũ
    product_col.update_many({}, {"$unset": {"frequentlyBoughtTogether": ""}})

    # Bước 1: Lấy đơn hàng và tính độ phổ biến (Popularity)
    orders = list(order_col.find({}, {"orderItems.name": 1}))
    transactions = [[item['name'] for item in o.get('orderItems', [])] 
                    for o in orders if len(o.get('orderItems', [])) > 0]
    
    # Tính toán sản phẩm bán chạy nhất để làm Fallback
    product_stats = {}
    for t in transactions:
        for item in t:
            product_stats[item] = product_stats.get(item, 0) + 1
    
    # Danh sách bán chạy nhất toàn sàn (Global Top)
    global_popular = sorted(product_stats.keys(), key=lambda x: product_stats[x], reverse=True)

    # Bước 2: Chạy Apriori (Chỉ lấy đơn có từ 2 món trở lên)
    multi_item_tx = [t for t in transactions if len(t) > 1]
    apriori_map = {}
    
    if multi_item_tx:
        print("Step 1: Analyzing orders with Apriori...")
        te = TransactionEncoder()
        te_ary = te.fit(multi_item_tx).transform(multi_item_tx)
        df_onehot = pd.DataFrame(te_ary, columns=te.columns_)
        
        # Hạ min_support để tránh bị trống kết quả
        frequent_itemsets = apriori(df_onehot, min_support=0.005, use_colnames=True)
        if not frequent_itemsets.empty:
            # Dùng metric lift để tìm sự liên quan mạnh
            rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
            rules = rules.sort_values(by=['lift', 'confidence'], ascending=False)
            
            for _, row in rules.iterrows():
                if len(row['antecedents']) == 1:
                    origin = list(row['antecedents'])[0]
                    target = list(row['consequents'])[0]
                    if origin not in apriori_map: apriori_map[origin] = []
                    if target not in apriori_map[origin] and len(apriori_map[origin]) < 10:
                        apriori_map[origin].append(target)

    # Bước 3: Mapping thông tin sản phẩm và Gom nhóm Category
    all_products = list(product_col.find({}, {"_id": 1, "name": 1, "category": 1, "image": 1, "images": 1, "price": 1}))
    
    def get_first_image(p):
        imgs = p.get('images') or p.get('image') or []
        if isinstance(imgs, list) and len(imgs) > 0: return imgs[0]
        if isinstance(imgs, str) and imgs != "": return imgs
        return ""

    info_lookup = {p['name']: {
        "id": p['_id'], 
        "image": get_first_image(p),
        "price": p.get('price', 0)
    } for p in all_products}

    # Gom nhóm theo Category và SẮP XẾP theo độ phổ biến
    cat_map = {}
    for p in all_products:
        cat = p['category']
        if cat not in cat_map: cat_map[cat] = []
        cat_map[cat].append(p['name'])
    
    for cat in cat_map:
        cat_map[cat].sort(key=lambda x: product_stats.get(x, 0), reverse=True)

    # Bước 4: Tạo danh sách Update với Logic 3 lớp
    print("Step 2: Building refined recommendation sets...")
    bulk_updates = []
    for p in all_products:
        p_name = p['name']
        final_names = []

        # Lớp 1: Ưu tiên Apriori (Mua cùng nhau)
        if p_name in apriori_map:
            final_names.extend([name for name in apriori_map[p_name] if name in info_lookup])

        # Lớp 2: Fallback - Sản phẩm bán chạy trong cùng Category
        if len(final_names) < 4:
            cat_fallbacks = cat_map.get(p['category'], [])
            for f_name in cat_fallbacks:
                if f_name != p_name and f_name not in final_names:
                    final_names.append(f_name)
                if len(final_names) >= 6: break # Lấy dư một chút để lọc

        # Lớp 3: Fallback cuối cùng - Sản phẩm bán chạy nhất hệ thống
        if len(final_names) < 4:
            for g_name in global_popular:
                if g_name != p_name and g_name not in final_names and g_name in info_lookup:
                    final_names.append(g_name)
                if len(final_names) >= 4: break

        # Chốt danh sách 4 món và format
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

    # Bước 5: Thực thi ghi vào DB
    if bulk_updates:
        result = product_col.bulk_write(bulk_updates)
        print(f"--- THÀNH CÔNG ---")
        print(f"Đã cập nhật gợi ý cho {result.modified_count} sản phẩm.")

if __name__ == "__main__":
    sync_recommendations_to_products()