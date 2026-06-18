import os
import random
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# ==========================================
# 1. DATABASE CONNECTION
# ==========================================
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME", "freshmart")]
products_col = db["products"]
users_col = db["users"]
orders_col = db["orders"]
interactions_col = db["interactions"]

print("Loading product catalog from MongoDB...")
all_products = list(products_col.find({}))
if not all_products:
    print("Error: No products found in the database!")
    exit()

# Map product names (lowercase, stripped) to actual DB objects
prod_name_map = {str(p.get("name")).strip().lower(): p for p in all_products}

def find_product_by_name(name_str):
    name_clean = name_str.strip().lower()
    if name_clean in prod_name_map:
        return prod_name_map[name_clean]
    for k, v in prod_name_map.items():
        if name_clean in k or k in name_clean:
            return v
    return None

# ==========================================
# 2. DEFINING MEAL PATTERNS BY SEGMENT
# ==========================================
RAW_SEGMENT_PATTERNS = {
    "STUDENT": [
        ["Banana", "Arla-Medium-Fat-Milk", "Yoggi-Vanilla-Yoghurt", "Bravo-Orange-Juice"],
        ["Apple", "Orange", "Banana", "Kiwi"],
        ["Bravo-Apple-Juice", "Bravo-Orange-Juice", "Tropicana-Apple-Juice"],
        ["Eggs", "Sausage", "Ham", "Milk"],
        ["Yoggi-Strawberry-Yoghurt", "Banana", "Orange", "Milk"]
    ],
    "OFFICE": [
        ["Apple", "Kiwi", "Natural Yoghurt", "Milk"],
        ["Mango", "Orange", "Pineapple", "Kiwi"],
        ["Salmon", "Lemon", "Potatoes"],
        ["Milk", "Natural Yoghurt", "Sour Cream"],
        ["Banana", "Orange Juice", "Yoghurt", "Apple"]
    ],
    "FAMILY": [
        ["Chicken Thighs", "Garlic", "Yellow Onion", "Carrots"],
        ["Beef Tenderloin", "Potatoes", "Tomato", "Yellow Onion"],
        ["Pork Ribs", "Sausage", "Red-Bell-Pepper", "Yellow Onion"],
        ["Pork Chops", "Potatoes", "Cabbage", "Carrots"],
        ["Chicken Drumsticks", "Carrots", "Potatoes", "Leek"],
        ["Beef Flank", "Sausage", "Bell Pepper", "Tomato"]
    ],
    "HEALTHY": [
        ["Avocado", "Cucumber", "Tomato", "Iceberg Lettuce"],
        ["Salmon", "Lemon", "Asparagus"],
        ["Kiwi", "Mango", "Orange", "Banana"],
        ["Cucumber", "Tomato", "Zucchini", "Bell Pepper"]
    ]
}

SEGMENT_PATTERNS = {}
for segment, patterns in RAW_SEGMENT_PATTERNS.items():
    SEGMENT_PATTERNS[segment] = []
    for pat in patterns:
        db_items = []
        for p_name in pat:
            found = find_product_by_name(p_name)
            if found:
                db_items.append(found)
        if db_items:
            SEGMENT_PATTERNS[segment].append(db_items)

# Cross-segment essentials acting as "Bridge Items" for Collaborative Filtering
BRIDGE_PRODUCT_NAMES = ["Yellow Onion", "Garlic", "Tomato", "Potatoes", "Milk", "Eggs", "Banana"]
bridge_products = [find_product_by_name(name) for name in BRIDGE_PRODUCT_NAMES if find_product_by_name(name) is not None]

SEARCH_QUERIES = ["fresh organic", "fruits", "pure milk", "beef ribs", "breakfast", "healthy diet", "spices"]

HCM_ADDRESSES = [
    {"address": "12 Ton Duc Thang", "provinceId": 79, "districtId": 760, "wardCode": "26734", "provinceName": "Thanh pho Ho Chi Minh", "districtName": "Quan 1", "wardName": "Phuong Ben Nghe"},
    {"address": "45 Le Loi", "provinceId": 79, "districtId": 760, "wardCode": "26740", "provinceName": "Thanh pho Ho Chi Minh", "districtName": "Quan 1", "wardName": "Phuong Ben Thanh"},
    {"address": "34 Cach Mang Thang Tam", "provinceId": 79, "districtId": 761, "wardCode": "26761", "provinceName": "Thanh pho Ho Chi Minh", "districtName": "Quan 3", "wardName": "Phuong Vo Thi Sau"},
    {"address": "520 Dien Bien Phu", "provinceId": 79, "districtId": 765, "wardCode": "26893", "provinceName": "Thanh pho Ho Chi Minh", "districtName": "Quan Binh Thanh", "wardName": "Phuong 21"}
]

# ==========================================
# 3. USER SEGMENT ASSIGNMENT (Stable Ratios)
# ==========================================
all_users = list(users_col.find({"role": "user"}))
random.shuffle(all_users)

user_assignments = {}
for idx, user in enumerate(all_users):
    if idx < 280:
        user_assignments[str(user['_id'])] = "STUDENT"
    elif idx < 280 + 234:
        user_assignments[str(user['_id'])] = "OFFICE"
    elif idx < 280 + 234 + 327:
        user_assignments[str(user['_id'])] = "FAMILY"
    else:
        user_assignments[str(user['_id'])] = "HEALTHY"

# ==========================================
# 4. GENERATING ORDERS & CORRESPONDING INTERACTIONS
# ==========================================
bulk_orders = []
bulk_interactions = []
user_history_updates = {}
stripe_counter = 0

print("Generating complex order matrices and funnel interaction histories...")

for user in all_users:
    u_id_str = str(user['_id'])
    segment = user_assignments[u_id_str]
    available_meal_pats = SEGMENT_PATTERNS.get(segment, [])
    
    if u_id_str not in user_history_updates:
        user_history_updates[u_id_str] = []
        
    num_orders = random.randint(4, 6)
    
    for _ in range(num_orders):
        session_id = f"sess_{ObjectId()}"
        # Random timeframe within the last 29 days to safely clear 30-day TTL index boundaries
        order_date = datetime.now() - timedelta(days=random.randint(1, 29))
        
        final_order_products = []
        roll = random.random()
        
        # --- LAYER 1: 75% Multi-Pattern Mix ---
        if roll < 0.75 and available_meal_pats:
            primary_pat = random.choice(available_meal_pats)
            sample_k = random.randint(max(2, len(primary_pat)-1), len(primary_pat))
            final_order_products.extend(random.sample(primary_pat, k=sample_k))
            
            if random.random() < 0.40 and len(available_meal_pats) > 1:
                alt_pat = random.choice([p for p in available_meal_pats if p != primary_pat])
                final_order_products.extend(random.sample(alt_pat, k=random.randint(1, 2)))
                
        # --- LAYER 2: 20% Category Exploitation & Up-selling ---
        elif roll < 0.95 and available_meal_pats:
            primary_pat = random.choice(available_meal_pats)
            final_order_products.extend(random.sample(primary_pat, k=random.randint(2, len(primary_pat))))
            ref_cat = random.choice(primary_pat).get("category")
            same_cat_items = [p for p in all_products if p.get("category") == ref_cat]
            if same_cat_items:
                final_order_products.extend(random.sample(same_cat_items, k=min(2, len(same_cat_items))))
                
        # --- LAYER 3: 5% Pure System Noise (Random Exploration) ---
        else:
            final_order_products.extend(random.sample(all_products, k=random.randint(2, 4)))
            
        # Add baseline bridge items with a 50% probability
        if random.random() < 0.50 and bridge_products:
            final_order_products.extend(random.sample(bridge_products, k=random.randint(1, 2)))
            
        # Remove duplicates within the current cart
        seen = set()
        unique_products = []
        for p in final_order_products:
            if p and p['_id'] not in seen:
                seen.add(p['_id'])
                unique_products.append(p)
                
        order_items_docs = []
        items_price = 0.0
        
        for p in unique_products:
            qty = random.randint(1, 2)
            price_val = float(p.get('price', 10.0))
            images_list = p.get('images', [])
            img_url = "https://via.placeholder.com/150"
            if isinstance(images_list, list) and len(images_list) > 0:
                img_url = images_list[0].get('url', img_url)
                
            order_items_docs.append({
                "product": p['_id'], "name": str(p.get('name', 'Organic Item')),
                "price": price_val, "quantity": qty, "image": img_url
            })
            items_price += price_val * qty
            user_history_updates[u_id_str].append({"product_id": p['_id']})
            
            # --- PROGRESSIVE E-COMMERCE CONVERSION FUNNEL ---
            # Step 1: Discover / View Product Detail
            bulk_interactions.append({
                "userId": user['_id'], "sessionId": session_id, "productId": p['_id'],
                "action": "view", "searchQuery": None, "score": 1,
                "timestamp": order_date - timedelta(minutes=random.randint(10, 25))
            })
            # Step 2: Intent Activation (Search-Click vs Navigation-Click)
            if random.random() < 0.35:
                bulk_interactions.append({
                    "userId": user['_id'], "sessionId": session_id, "productId": p['_id'],
                    "action": "search_click", "searchQuery": random.choice(SEARCH_QUERIES), "score": 2,
                    "timestamp": order_date - timedelta(minutes=random.randint(5, 10))
                })
            else:
                bulk_interactions.append({
                    "userId": user['_id'], "sessionId": session_id, "productId": p['_id'],
                    "action": "click", "searchQuery": None, "score": 2,
                    "timestamp": order_date - timedelta(minutes=random.randint(5, 10))
                })
            # Step 3: Add to Cart Evaluation
            bulk_interactions.append({
                "userId": user['_id'], "sessionId": session_id, "productId": p['_id'],
                "action": "add_to_cart", "searchQuery": None, "score": 3,
                "timestamp": order_date - timedelta(minutes=random.randint(2, 5))
            })
            # Step 4: Confirmed Checkout Order Completion
            bulk_interactions.append({
                "userId": user['_id'], "sessionId": session_id, "productId": p['_id'],
                "action": "order", "searchQuery": None, "score": 5,
                "timestamp": order_date
            })

        if not order_items_docs:
            continue
            
        # --- GENERATE NON-CONVERTING INTERACTION NOISE (Bounces) ---
        # Products browsed but explicitly rejected—essential for quality Collaborative Filtering models
        noise_items = random.sample(all_products, k=random.randint(1, 3))
        for np in noise_items:
            if np['_id'] not in seen:
                bulk_interactions.append({
                    "userId": user['_id'], "sessionId": session_id, "productId": np['_id'],
                    "action": "view", "searchQuery": None, "score": 1,
                    "timestamp": order_date - timedelta(minutes=random.randint(5, 20))
                })
                if random.random() < 0.45:
                    bulk_interactions.append({
                        "userId": user['_id'], "sessionId": session_id, "productId": np['_id'],
                        "action": "click", "searchQuery": None, "score": 2,
                        "timestamp": order_date - timedelta(minutes=random.randint(2, 5))
                    })

        shipping_price = 15.0 if items_price < 50.0 else 0.0
        total_price = items_price + shipping_price
        
        real_name = user.get('name') or user.get('fullName') or "Vegan Customer"
        real_phone = user.get('phone') or user.get('phoneNumber') or "0900000000"
        chosen_geo = random.choice(HCM_ADDRESSES)
        
        shipping_info_doc = {
            "fullName": real_name, "phone": real_phone,
            "address": chosen_geo["address"], "provinceId": chosen_geo["provinceId"],
            "districtId": chosen_geo["districtId"], "wardCode": chosen_geo["wardCode"],
            "provinceName": chosen_geo["provinceName"], "districtName": chosen_geo["districtName"],
            "wardName": chosen_geo["wardName"], "city": "HCM", "country": "Vietnam"
        }
        
        stripe_counter += 1
        pay_method = "COD" if stripe_counter % 6 == 0 else "Stripe"
        
        payment_info_doc = {
            "id": f"ch_{ObjectId()}" if pay_method == "Stripe" else f"cod_{ObjectId()}",
            "status": "Paid" if pay_method == "Stripe" else "Pending",
            "method": pay_method,
            "paidAt": order_date if pay_method == "Stripe" else None
        }
        
        order_doc = {
            "user": user['_id'], "orderItems": order_items_docs, "shippingInfo": shipping_info_doc,
            "paymentInfo": payment_info_doc, "itemsPrice": round(items_price, 2),
            "shippingPrice": round(shipping_price, 2), "totalPrice": round(total_price, 2),
            "paidAt": order_date if pay_method == "Stripe" else None, "orderStatus": "Delivered",
            "deliveredAt": order_date + timedelta(days=random.randint(1, 2)),
            "createdAt": order_date, "updatedAt": order_date
        }
        bulk_orders.append(order_doc)

# ==========================================
# 5. ATOMIC PURGE AND INJECTION EXECUTION
# ==========================================
print("\n--- Starting Database Synchronization ---")

# 1. Purging collections to wipe out mismatched historical states
print("Clearing out old records from 'orders' collection...")
orders_col.delete_many({})

print("Clearing out old records from 'interactions' collection...")
interactions_col.delete_many({})

# 2. Injecting newly generated alignment datasets
if bulk_orders:
    print(f"Injecting {len(bulk_orders)} structured multi-segment orders...")
    orders_col.insert_many(bulk_orders)
    
    print(f"Injecting {len(bulk_interactions)} multi-score contextual user interactions...")
    interactions_col.insert_many(bulk_interactions)
    
    print("Syncing historical 'orderedItems' array meta-tags back onto individual user documents...")
    for u_id_str, items in user_history_updates.items():
        unique_items = list({v['product_id']: v for v in items}.values())
        users_col.update_one(
            {"_id": ObjectId(u_id_str)},
            {"$set": {"customerGroup": user_assignments[u_id_str], "orderedItems": unique_items, "cartItems": [], "total_cart": 0}}
        )
    print("Success! The data ecosystem has been perfectly aligned for FP-Growth and Collaborative Filtering algorithms.")
else:
    print("Process finished with no items generated.")