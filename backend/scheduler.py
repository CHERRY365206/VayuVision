import time
import schedule
from datetime import datetime

# Import the database function we wrote earlier
from database import save_current_data

def ingestion_job():
    """The function that runs every time the clock strikes."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"\n[{timestamp}] ⏰ Scheduler Triggered: Waking up database worker...")
    
    try:
        # Run the full pipeline
        save_current_data()
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 💤 Job complete. Going back to sleep.")
    except Exception as e:
        print(f"❌ Automation failed during scheduled run: {e}")

# ==========================================
# ⏱️ SCHEDULING RULES
# ==========================================
# For the hackathon demo, you might want this to be every 15 minutes. 
# But for production, every 1 hour is perfect to avoid API rate limits.
schedule.every(1).hours.do(ingestion_job)

if __name__ == "__main__":
    print("🚀 VayuVision Background Automation Engine Started!")
    print("⚙️  Running initial baseline data pull...")
    
    # Run it once immediately on startup so we don't have to wait an hour
    ingestion_job()
    
    print("\n⏳ Scheduler is active. Waiting for the next cycle (1 hour)...")
    print("⚠️  (Keep this terminal window open to keep the automation running)")
    
    # The infinite loop that keeps the script alive and checking the clock
    while True:
        schedule.run_pending()
        time.sleep(1) # Sleep for 1 second to save CPU power, then check the clock again