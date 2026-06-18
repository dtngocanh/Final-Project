import os
import random
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import mean_squared_error, mean_absolute_error

# CONFIG
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

# Collections
interaction_col = db["interactions"]
rating_col = db["reviews"]
product_col = db["products"]
user_col = db["users"]
recs_col = db["user_recommendations"]

TOP_K = 12
DECAY_STRENGTH = 90

# Interaction weights
ACTION_WEIGHTS = {
    "rating": 10,
    "order": 8,
    "add_to_cart": 5, # Synced with your automated script format
    "click": 2,
    "view": 1
}

# TIME DECAY
def apply_time_decay(base_score, created_at):
    if not created_at:
        return base_score
    days_old = (datetime.now() - created_at).days
    return base_score * np.exp(-days_old / DECAY_STRENGTH)

# CLEAR OLD RECOMMENDATIONS
def clear_old_recommendations():
    print("[0] Clearing old recommendations...")
    result = recs_col.delete_many({})
    print(f"Deleted {result.deleted_count} old records")

# ACCURACY EVALUATION METHOD
def evaluate_svd_accuracy(matrix_centered, latent_matrix, components, user_mean):
    preds = np.dot(latent_matrix, components)
    df_preds = pd.DataFrame(preds, index=matrix_centered.index, columns=matrix_centered.columns)
    df_preds = df_preds.add(user_mean, axis=0)
    
    actuals = []
    predictions = []
    
    matrix_actual = matrix_centered.add(user_mean, axis=0)
    nonzero_coords = np.argwhere(matrix_actual.values > 0)
    
    if len(nonzero_coords) == 0:
        print(" No interactions found to calculate model metrics.")
        return
        
    sampled_coords = random.sample(list(nonzero_coords), min(len(nonzero_coords), 20000))
    for row, col in sampled_coords:
        actuals.append(matrix_actual.iloc[row, col])
        predictions.append(df_preds.iloc[row, col])
        
    rmse = np.sqrt(mean_squared_error(actuals, predictions))
    mae = mean_absolute_error(actuals, predictions)
    
    print(f"\n --- MODEL METRICS ---")
    print(f" RMSE (Root Mean Squared Error): {rmse:.4f} (Lower is better)")
    print(f" MAE (Mean Absolute Error):     {mae:.4f} (Lower is better)")
    print(f"-------------------------\n")

# MAIN ENGINE
def run_recommender_system():
    print(f"\n=== STARTING SVD ENGINE ===")

    # STEP 0: CLEAR OLD DATA
    clear_old_recommendations()

    # STEP 1: LOAD PRODUCTS
    print("[1] Loading products...")
    products_cursor = list(product_col.find({}))
    all_products = {
        str(p["_id"]): {
            "name": p.get("name"),
            "price": p.get("price"),
            "category": str(p.get("category")) if p.get("category") else None,
            "categoryName": p.get("categoryName") or "Essentials" # Dynamic matching field
        }
        for p in products_cursor
    }

    # STEP 2: GATHER DATA
    print("[2] Gathering interactions & ratings...")
    raw_data = []

    # A. RATINGS (EXPLICIT FEEDBACK)
    for rev in rating_col.find():
        u_id = str(rev.get("user"))
        p_id = str(rev.get("product"))
        if not u_id or not p_id:
            continue
        rating_value = rev.get("rating", 0)
        score = (rating_value / 5) * ACTION_WEIGHTS["rating"]
        raw_data.append({"userId": u_id, "productId": p_id, "score": score})

    # B. INTERACTIONS (IMPLICIT FEEDBACK)
    for inter in interaction_col.find({"userId": {"$ne": None}}):
        u_id = str(inter.get("userId"))
        p_id = str(inter.get("productId"))
        if not u_id or not p_id:
            continue
        action = inter.get("action", "view")
        base_score = ACTION_WEIGHTS.get(action, 1)
        score = apply_time_decay(
            base_score,
            inter.get("timestamp") or inter.get("createdAt")
        )
        raw_data.append({"userId": u_id, "productId": p_id, "score": score})

    # DATAFRAME
    df = pd.DataFrame(raw_data)
    if df.empty:
        print("No interaction data found")
        return

    # STEP 3: PREPROCESS MATRIX
    print("[3] Building utility matrix...")
    df_grouped = df.groupby(["userId", "productId"])["score"].sum().reset_index()
    df_grouped["score"] = np.log1p(df_grouped["score"])

    matrix = df_grouped.pivot(index="userId", columns="productId", values="score").fillna(0)
    user_mean = matrix.mean(axis=1)
    matrix_centered = matrix.sub(user_mean, axis=0)

    # STEP 4: SVD
    print("[4] Running SVD...")
    n_components = max(1, min(matrix.shape[1] - 1, 50))
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    latent_matrix = svd.fit_transform(matrix_centered)

    # Evaluate accuracy immediately using non-zero elements
    evaluate_svd_accuracy(matrix_centered, latent_matrix, svd.components_, user_mean)

    preds = np.dot(latent_matrix, svd.components_)
    df_preds = pd.DataFrame(preds, index=matrix.index, columns=matrix.columns)
    df_preds = df_preds.add(user_mean, axis=0)

    # STEP 5: GENERATE RECOMMENDATIONS WITH DYNAMIC REASONS
    print("[5] Generating recommendations...")
    bulk_updates = []
    users = list(user_col.find({}, {"_id": 1}))

    for user in users:
        u_id = str(user["_id"])
        recommendations = []

        if u_id not in df_preds.index:
            continue

        user_history = df_grouped[df_grouped["userId"] == u_id]
        interacted_products = set(user_history["productId"].values)

        # Calculate user's category preference weights
        user_cat_affinity = {}
        for _, row in user_history.iterrows():
            p_info = all_products.get(row["productId"])
            if p_info:
                cat_name = p_info["categoryName"]
                user_cat_affinity[cat_name] = user_cat_affinity.get(cat_name, 0) + row["score"]

        user_scores = df_preds.loc[u_id].sort_values(ascending=False)

        for p_id, score in user_scores.items():
            if p_id not in all_products or p_id in interacted_products:
                continue

            target_product = all_products[p_id]
            target_cat = target_product["categoryName"]
            
            # --- SHORT SHORT REASONS LOGIC ---
            if target_cat in user_cat_affinity and user_cat_affinity[target_cat] > 5:
                reason = f"Top choice in {target_cat}"
            elif score > df_preds.loc[u_id].median() + 1.2:
                reason = "Trending item for you"
            else:
                reason = "Recommended for you"

            recommendations.append({
                "productId": ObjectId(p_id),
                "type": "personalized",
                "reason": reason
            })

            if len(recommendations) >= TOP_K:
                break

        bulk_updates.append(
            UpdateOne(
                {"userId": user["_id"]},
                {
                    "$set": {
                        "recommendations": recommendations,
                        "updatedAt": datetime.now()
                    }
                },
                upsert=True
            )
        )

    # SAVE TO DATABASE
    if bulk_updates:
        recs_col.bulk_write(bulk_updates)
    print("=== RECOMMENDATION REFRESH COMPLETE ===")

if __name__ == "__main__":
    run_recommender_system()