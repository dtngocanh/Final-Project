# scheduler.py
from ingest import start_ingest
from freqb import sync_recommendations_to_products
from personalize_recmd import run_recommender_system 
from recommend_engine import build_final_recommendations

def run_all():
    print("--- Bắt đầu quy trình ---")
    start_ingest()
    sync_recommendations_to_products()
    run_recommender_system()
    build_final_recommendations()
    print("--- Xong tất cả! ---")

if __name__ == "__main__":
    run_all()