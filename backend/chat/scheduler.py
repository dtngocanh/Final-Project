# scheduler.py
from backend.chat.scripts.ingest import start_ingest
from backend.chat.scripts.freqb import sync_recommendations_to_products
from backend.chat.scripts.personalize_recmd import run_recommender_system 
from backend.chat.scripts.recommend_engine import  build_final_recommendations

def run_all():
    print("Start process...")
    start_ingest()
    sync_recommendations_to_products()
    run_recommender_system ()
    build_final_recommendations()
    print("Done!")

if __name__ == "__main__":
    run_all()