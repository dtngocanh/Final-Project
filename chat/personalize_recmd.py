import os
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
from sklearn.decomposition import TruncatedSVD

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
    "add-to-cart": 5,
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

            # category là ObjectId -> convert string
            "category": str(p.get("category")) if p.get("category") else None,

            "image": (
                p.get("images")[0].get("url", "")
                if p.get("images")
                else ""
            )
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

        score = (
            rating_value / 5
        ) * ACTION_WEIGHTS["rating"]

        raw_data.append({
            "userId": u_id,
            "productId": p_id,
            "score": score
        })

    # B. INTERACTIONS (IMPLICIT FEEDBACK)
    for inter in interaction_col.find({
        "userId": {"$ne": None}
    }):

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

        raw_data.append({
            "userId": u_id,
            "productId": p_id,
            "score": score
        })

    # DATAFRAME
    df = pd.DataFrame(raw_data)

    if df.empty:
        print("No interaction data found")
        return

    # STEP 3: PREPROCESS MATRIX
    print("[3] Building utility matrix...")

    # Sum duplicated interactions
    df_grouped = (
        df.groupby(["userId", "productId"])["score"]
        .sum()
        .reset_index()
    )

    # Reduce noise
    df_grouped["score"] = np.log1p(df_grouped["score"])

    # Pivot matrix
    matrix = df_grouped.pivot(
        index="userId",
        columns="productId",
        values="score"
    ).fillna(0)

    # User mean normalization
    user_mean = matrix.mean(axis=1)

    matrix_centered = matrix.sub(user_mean, axis=0)

    # STEP 4: SVD
    print("[4] Running SVD...")

    n_components = max(
        1,
        min(matrix.shape[1] - 1, 50)
    )

    svd = TruncatedSVD(
        n_components=n_components,
        random_state=42
    )

    latent_matrix = svd.fit_transform(matrix_centered)

    preds = np.dot(
        latent_matrix,
        svd.components_
    )

    df_preds = pd.DataFrame(
        preds,
        index=matrix.index,
        columns=matrix.columns
    )

    # Add user mean back
    df_preds = df_preds.add(user_mean, axis=0)

    # STEP 5: GENERATE RECOMMENDATIONS
    print("[5] Generating recommendations...")

    bulk_updates = []

    users = list(user_col.find({}, {"_id": 1}))

    for user in users:

        u_id = str(user["_id"])

        recommendations = []

        # User chưa có interaction
        if u_id not in df_preds.index:
            continue

        # Sản phẩm user đã từng tương tác
        interacted_products = set(
            df_grouped[
                df_grouped["userId"] == u_id
            ]["productId"].values
        )

        # Predict scores
        user_scores = (
            df_preds.loc[u_id]
            .sort_values(ascending=False)
        )

        for p_id, score in user_scores.items():

            # Skip sản phẩm không tồn tại
            if p_id not in all_products:
                continue

            # Skip sản phẩm đã tương tác
            if p_id in interacted_products:
                continue

            recommendations.append({
                "productId": ObjectId(p_id),
                "type": "personalized",
                "reason": "Based on your interests"
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

# RUN
if __name__ == "__main__":
    run_recommender_system()

