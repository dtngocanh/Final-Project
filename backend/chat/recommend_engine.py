import os
import numpy as np
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db["products"] 

def evaluate_vector_quality(sim_matrix, products):
    """
    Checks if similar vectors belong to the same category.
    Calculates the category coherence score among top 6 matches.
    """
    category_match_count = 0
    total_checked_links = 0
    
    for i in range(len(products)):
        current_cat = str(products[i].get('category', ''))
        if not current_cat:
            continue
            
        scores = sim_matrix[i].copy()
        scores[i] = -1
        top_indices = np.argsort(scores)[::-1][:6]
        
        for idx in top_indices:
            if str(products[idx].get('category', '')) == current_cat:
                category_match_count += 1
            total_checked_links += 1
            
    if total_checked_links == 0:
        print("No category data found for evaluation.")
        return
        
    coherence_rate = category_match_count / total_checked_links
    
    print("\n--- HYBRID MODEL METRICS ---")
    print(f"Category Coherence Rate: {coherence_rate:.4f} (Higher means embeddings are learning correctly)")
    print(f"Stats: Found {category_match_count}/{total_checked_links} links matching the same category.")
    print("-------------------------\n")

def build_final_recommendations():
    print("Running Hybrid Recommendation algorithm...")

    # 1. Fetch data
    projection = {"_id": 1, "embedding": 1, "category": 1, "categoryName": 1, "salesCount": 1, "viewCount": 1, "name": 1}
    products = list(collection.find({"embedding": {"$exists": True}}, projection))
    
    if not products:
        print("No embedding data found!")
        return

    product_ids = [p['_id'] for p in products]
    embeddings_matrix = np.array([p['embedding'] for p in products])
    
    # 2. Process Popularity Score (Sales + Views)
    stats = []
    for p in products:
        s = p.get('salesCount', 0) if p.get('salesCount') is not None else 0
        v = p.get('viewCount', 0) if p.get('viewCount') is not None else 0
        stats.append([s, v])
    
    stats_matrix = np.array(stats)
    scaler = MinMaxScaler()
    normalized_stats = scaler.fit_transform(stats_matrix)
    pop_scores = (normalized_stats[:, 0] * 0.7) + (normalized_stats[:, 1] * 0.3)

    # 3. Calculate Vector Similarity
    sim_matrix = cosine_similarity(embeddings_matrix)

    # Run quality validation check
    evaluate_vector_quality(sim_matrix, products)

    bulk_updates = []

    # 4. Combine all factors
    for i in range(len(products)):
        scores = sim_matrix[i]
        
        # Add 50% boost if items share the same category
        current_cat = products[i].get('category')
        current_cat_name = products[i].get('categoryName', 'Essentials')
        category_boost = np.array([1.5 if p.get('category') == current_cat else 1.0 for p in products])
        
        # Hybrid formula
        final_scores = (scores * category_boost) + (pop_scores * 0.2)
        
        # Remove self-matching
        final_scores[i] = -1 

        # Get top 6 highest scoring items
        top_indices = np.argsort(final_scores)[::-1][:6]
        
        related_products_data = []
        for idx in top_indices:
            target_product = products[idx]
            
            # Simple short reasons logic
            if target_product.get('category') == current_cat:
                reason = f"More in {current_cat_name}"
            elif pop_scores[idx] > 0.6:
                reason = "Best seller"
            else:
                reason = "Similar item"

            related_products_data.append({
                "productId": ObjectId(target_product['_id']),
                "reason": reason
            })

        bulk_updates.append(
            UpdateOne(
                {"_id": product_ids[i]},
                {"$set": {"related_products": related_products_data}}
            )
        )

    # 5. Save to Database
    if bulk_updates:
        collection.bulk_write(bulk_updates)
        print(f"Updated Related Products for {len(products)} items.")

if __name__ == "__main__":
    build_final_recommendations()