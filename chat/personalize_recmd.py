import os
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
from sklearn.decomposition import TruncatedSVD

# --- SYSTEM CONFIGURATION ---
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

# Collections
interaction_col = db["interactions"]
rating_col = db["ratings"]
product_col = db["products"]
order_col = db["orders"]
user_col = db["users"]
recs_col = db["user_recommendations"]

# Hyperparameters
TOP_K = 12
DECAY_STRENGTH = 90  # Days for time decay half-life

# Refined weights based on commitment levels
ACTION_WEIGHTS = {
    "rating": 10,        # Explicit satisfaction
    "purchase": 8,       # Verified purchase
    "add-to-cart": 5,    # High intent
    "click": 2,          # General interest
    "view": 1
}

def apply_time_decay(base_score, created_at):
    """Reduces score weight as the interaction gets older."""
    if not created_at:
        return base_score
    days_old = (datetime.now() - created_at).days
    return base_score * np.exp(-days_old / DECAY_STRENGTH)

def clear_old_recommendations():
    """Wipes the existing recommendations to ensure a fresh calculation."""
    print("[0] Clearing old recommendation data...")
    result = recs_col.delete_many({})
    print(f"    Successfully deleted {result.deleted_count} old records.")

def run_recommender_system():
    print(f"\n--- STARTING SVD ENGINE: {datetime.now()} ---")
    
    # STEP 0: Cleanup
    clear_old_recommendations()

    # STEP 1: Load Product Metadata
    print("[1] Mapping product metadata...")
    products_cursor = list(product_col.find({}))
    all_products = {str(p["_id"]): {
        "name": p.get("name"),
        "price": p.get("price"),
        "category": str(p.get("category", "General")),
        "image": p.get("images")[0].get("url", "") if p.get("images") else ""
    } for p in products_cursor}

    # STEP 2: Aggregate Multi-Source Data
    print("[2] Gathering interactions, ratings, and orders...")
    raw_data = []
    user_purchased = {} 

    # A. Ratings (Explicit Feedback)
    for rev in rating_col.find():
        u_id, p_id = str(rev.get("user")), str(rev.get("product"))
        if u_id and p_id:
            # Scale 1-5 stars to the rating weight
            score = (rev.get("rating", 0) / 5) * ACTION_WEIGHTS["rating"]
            raw_data.append({"userId": u_id, "productId": p_id, "score": score})

    # B. Orders (High Intent Feedback - Exclude 'Canceled')
    valid_statuses = ["Delivered", "Processing", "Shipped", "delivered", "processing"]
    for order in order_col.find({"orderStatus": {"$in": valid_statuses}}):
        u_id = str(order.get("user"))
        if u_id not in user_purchased: user_purchased[u_id] = set()
        
        order_date = order.get("paidAt") or order.get("createdAt")
        for item in order.get("orderItems", []):
            p_id = str(item.get("product"))
            user_purchased[u_id].add(p_id)
            score = apply_time_decay(ACTION_WEIGHTS["purchase"], order_date)
            raw_data.append({"userId": u_id, "productId": p_id, "score": score})

    # C. Interactions (Implicit Feedback)
    for inter in interaction_col.find({"userId": {"$ne": None}}):
        u_id, p_id = str(inter["userId"]), str(inter["productId"])
        base_s = ACTION_WEIGHTS.get(inter.get("action"), 1)
        score = apply_time_decay(base_s, inter.get("timestamp") or inter.get("createdAt"))
        raw_data.append({"userId": u_id, "productId": p_id, "score": score})

    df = pd.DataFrame(raw_data)
    if df.empty: 
        print("No data found to process.")
        return

    # STEP 3: SVD Matrix Pre-processing
    print("[3] Normalizing utility matrix...")
    # Sum scores to capture cumulative interest
    df_grouped = df.groupby(["userId", "productId"])["score"].sum().reset_index()
    
    # Log-scaling to dampen the effect of hyperactive users (noise reduction)
    df_grouped["score"] = np.log1p(df_grouped["score"])

    # Create Pivot Table
    matrix = df_grouped.pivot(index="userId", columns="productId", values="score").fillna(0)
    
    # USER-MEAN NORMALIZATION: Subtract mean to focus on relative preference (de-meaning)
    user_ratings_mean = matrix.mean(axis=1)
    matrix_centered = matrix.sub(user_ratings_mean, axis=0)

    # STEP 4: Compute Latent Factors
    print("[4] Executing SVD decomposition...")
    n_comp = max(1, min(matrix.shape[1] - 1, 50))
    svd = TruncatedSVD(n_components=n_comp, random_state=42)
    latent_matrix = svd.fit_transform(matrix_centered)
    
    # Reconstruct predictions and add user means back
    preds = np.dot(latent_matrix, svd.components_)
    df_preds = pd.DataFrame(preds, index=matrix.index, columns=matrix.columns)
    df_preds = df_preds.add(user_ratings_mean, axis=0)

    # STEP 5: Generate and Bulk Write Results
    # STEP 5: Chỉ lưu ID tham chiếu
    print("[5] Finalizing personalized recommendations...")
    bulk_updates = []
    all_users = list(user_col.find({}, {"_id": 1}))

    for user in all_users:
        u_id = str(user["_id"])
        final_recs = []

        if u_id in df_preds.index:
            user_scores = df_preds.loc[u_id].sort_values(ascending=False)
            for p_id, score in user_scores.items():
                # Kiểm tra xem sản phẩm còn tồn tại trong bảng products không
                if p_id not in all_products:
                    continue
                
                # CHỈ LƯU productId VÀ reason
                final_recs.append({
                    "productId": ObjectId(p_id),
                    "type": "personalized",
                    "reason": "Based on your interest"
                })
                if len(final_recs) >= TOP_K: 
                    break

        bulk_updates.append(UpdateOne(
            {"userId": user["_id"]},
            {"$set": {
                "recommendations": final_recs, 
                "updatedAt": datetime.now()
            }},
            upsert=True
        ))

    if bulk_updates:
        recs_col.bulk_write(bulk_updates)
    print(f"--- REFRESH COMPLETE ---")

if __name__ == "__main__":
    run_recommender_system()