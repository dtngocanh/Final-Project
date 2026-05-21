# Improved SVD Recommendation Engine

import os
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
from sklearn.decomposition import TruncatedSVD
from collections import Counter

# =========================================================
# CONFIGURATION
# =========================================================
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

# Collections
interaction_col = db["interactions"]
rating_col = db["reviews"]
product_col = db["products"]
user_col = db["users"]
recs_col = db["user_recommendations"]

# =========================================================
# HYPERPARAMETERS
# =========================================================
TOP_K = 12
MAX_COMPONENTS = 50
DECAY_STRENGTH = 90
MIN_INTERACTIONS = 2

# Action Weights
ACTION_WEIGHTS = {
    "view": 1,
    "click": 2,
    "add-to-cart": 5,
    "purchase": 8,
    "order": 8,
    "wishlist": 4,
    "rating": 10
}

# =========================================================
# UTILS
# =========================================================
def apply_time_decay(score, created_at):
    """
    Apply exponential time decay.
    Recent interactions are more important.
    """

    if not created_at:
        return score

    days_old = (datetime.now() - created_at).days

    decay = np.exp(-days_old / DECAY_STRENGTH)

    return score * decay


def clear_old_recommendations():
    print("[0] Clearing old recommendations...")
    result = recs_col.delete_many({})
    print(f"Deleted {result.deleted_count} old recommendations")


# =========================================================
# LOAD PRODUCT METADATA
# =========================================================
def load_products():
    print("[1] Loading product metadata...")

    products_cursor = list(product_col.find({}))

    all_products = {}
    product_categories = {}

    for p in products_cursor:
        p_id = str(p["_id"])

        category = str(p.get("category", "General"))

        all_products[p_id] = {
            "name": p.get("name"),
            "price": p.get("price", 0),
            "category": category,
            "image": p.get("images", [{}])[0].get("url", "") if p.get("images") else "",
            "salesCount": p.get("salesCount", 0),
            "viewCount": p.get("viewCount", 0)
        }

        product_categories[p_id] = category

    return all_products, product_categories


# =========================================================
# LOAD RATINGS (EXPLICIT FEEDBACK)
# =========================================================
def load_ratings(raw_data, user_category_counter, product_categories):
    print("[2A] Loading ratings...")

    count = 0

    for rev in rating_col.find():
        u_id = str(rev.get("user"))
        p_id = str(rev.get("product"))

        if not u_id or not p_id:
            continue

        rating_value = rev.get("rating", 0)

        score = (rating_value / 5) * ACTION_WEIGHTS["rating"]

        raw_data.append({
            "userId": u_id,
            "productId": p_id,
            "score": score
        })

        category = product_categories.get(p_id)
        if category:
            user_category_counter.setdefault(u_id, []).append(category)

        count += 1

    print(f"Loaded {count} ratings")


# =========================================================
# LOAD INTERACTIONS (IMPLICIT FEEDBACK)
# =========================================================
def load_interactions(
    raw_data,
    user_purchased,
    user_category_counter,
    product_categories
):
    print("[2B] Loading interactions...")

    count = 0

    interactions = interaction_col.find({
        "userId": {"$ne": None},
        "productId": {"$ne": None}
    })

    for inter in interactions:
        try:
            u_id = str(inter["userId"])
            p_id = str(inter["productId"])

            action = inter.get("action", "view")

            # Use custom score if available
            base_score = inter.get("score")

            if base_score is None:
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

            # Save purchased products
            if action in ["purchase", "order"]:
                if u_id not in user_purchased:
                    user_purchased[u_id] = set()

                user_purchased[u_id].add(p_id)

            # Save category preference
            category = product_categories.get(p_id)
            if category:
                user_category_counter.setdefault(u_id, []).append(category)

            count += 1

        except Exception as e:
            print(f"Interaction error: {e}")

    print(f"Loaded {count} interactions")


# =========================================================
# BUILD USER-PRODUCT MATRIX
# =========================================================
def build_matrix(raw_data):
    print("[3] Building utility matrix...")

    df = pd.DataFrame(raw_data)

    if df.empty:
        print("No interaction data found")
        return None, None, None

    # Sum repeated interactions
    grouped = (
        df.groupby(["userId", "productId"])["score"]
        .sum()
        .reset_index()
    )

    # Log normalization
    grouped["score"] = np.log1p(grouped["score"])

    # Build pivot matrix
    matrix = grouped.pivot(
        index="userId",
        columns="productId",
        values="score"
    ).fillna(0)

    # User mean normalization
    user_means = matrix.mean(axis=1)

    matrix_centered = matrix.sub(user_means, axis=0)

    print(f"Matrix shape: {matrix.shape}")

    return matrix, matrix_centered, user_means


# =========================================================
# RUN SVD
# =========================================================
def run_svd(matrix_centered, user_means):
    print("[4] Running SVD decomposition...")

    n_components = max(
        1,
        min(matrix_centered.shape[1] - 1, MAX_COMPONENTS)
    )

    svd = TruncatedSVD(
        n_components=n_components,
        random_state=42
    )

    latent_matrix = svd.fit_transform(matrix_centered)

    reconstructed = np.dot(
        latent_matrix,
        svd.components_
    )

    predictions = pd.DataFrame(
        reconstructed,
        index=matrix_centered.index,
        columns=matrix_centered.columns
    )

    predictions = predictions.add(user_means, axis=0)

    explained_variance = svd.explained_variance_ratio_.sum()

    print(f"Explained variance: {explained_variance:.4f}")

    return predictions


# =========================================================
# GENERATE RECOMMENDATIONS
# =========================================================
def generate_recommendations(
    predictions,
    all_products,
    user_purchased,
    user_category_counter
):
    print("[5] Generating recommendations...")

    bulk_updates = []

    users = list(user_col.find({}, {"_id": 1}))

    for user in users:
        u_id = str(user["_id"])

        recommendations = []
        used_categories = Counter()

        # Cold start
        if u_id not in predictions.index:
            continue

        # Favorite categories
        favorite_categories = []

        if u_id in user_category_counter:
            favorite_categories = [
                cat for cat, _ in Counter(
                    user_category_counter[u_id]
                ).most_common(3)
            ]

        user_scores = (
            predictions.loc[u_id]
            .sort_values(ascending=False)
        )

        for p_id, score in user_scores.items():

            # Product removed
            if p_id not in all_products:
                continue

            # Skip purchased products
            if p_id in user_purchased.get(u_id, set()):
                continue

            product = all_products[p_id]
            category = product["category"]

            # Category affinity boost
            if category in favorite_categories:
                score += 0.3

            # Diversity control
            if used_categories[category] >= 4:
                continue

            # Dynamic reason generation
            reason = "Based on your interests"

            if category in favorite_categories:
                reason = f"Popular in your favorite category: {category}"

            recommendations.append({
                "productId": ObjectId(p_id),
                "type": "personalized",
                "reason": reason,
                "score": round(float(score), 4)
            })

            used_categories[category] += 1

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

    if bulk_updates:
        result = recs_col.bulk_write(bulk_updates)
        print(f"Updated {result.modified_count} users")


# =========================================================
# EVALUATION METRICS
# =========================================================
def print_system_statistics(raw_data):
    print("\n================ SYSTEM STATS ================")

    df = pd.DataFrame(raw_data)

    if df.empty:
        return

    total_interactions = len(df)
    unique_users = df["userId"].nunique()
    unique_products = df["productId"].nunique()

    sparsity = 1 - (
        total_interactions /
        (unique_users * unique_products)
    )

    print(f"Total interactions : {total_interactions}")
    print(f"Unique users       : {unique_users}")
    print(f"Unique products    : {unique_products}")
    print(f"Matrix sparsity    : {sparsity:.4f}")

    print("================================================\n")


# =========================================================
# MAIN PIPELINE
# =========================================================
def run_recommender_system():

    print("\n========================================")
    print(f"STARTING SVD ENGINE - {datetime.now()}")
    print("========================================\n")

    clear_old_recommendations()

    # Product metadata
    all_products, product_categories = load_products()

    # Containers
    raw_data = []
    user_purchased = {}
    user_category_counter = {}

    # Load feedback
    load_ratings(
        raw_data,
        user_category_counter,
        product_categories
    )

    load_interactions(
        raw_data,
        user_purchased,
        user_category_counter,
        product_categories
    )

    print_system_statistics(raw_data)

    # Build matrix
    matrix, matrix_centered, user_means = build_matrix(raw_data)

    if matrix is None:
        return

    # Minimum interaction check
    if matrix.shape[0] < MIN_INTERACTIONS:
        print("Not enough users for SVD")
        return

    # SVD predictions
    predictions = run_svd(
        matrix_centered,
        user_means
    )

    # Final recommendations
    generate_recommendations(
        predictions,
        all_products,
        user_purchased,
        user_category_counter
    )

    print("\n========================================")
    print("RECOMMENDATION REFRESH COMPLETE")
    print("========================================\n")


# =========================================================
# ENTRY POINT
# =========================================================
if __name__ == "__main__":
    run_recommender_system()
