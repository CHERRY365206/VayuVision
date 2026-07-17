import sqlite3
import os
import pandas as pd
from datetime import datetime

# Import data collection functions from your ingestion file
from data_ingestion import fetch_cpcb_data, fetch_weather_data, MIN_LAT, MAX_LAT, MIN_LON, MAX_LON

# Absolute path to ensure the database file drops cleanly inside the backend folder
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vayuvision.db")

def init_db():
    """Initializes the SQLite database and creates structural tables if missing."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table 1: Air Quality Sensor Data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ground_sensors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            station TEXT,
            pollutant_id TEXT,
            pollutant_min REAL,
            pollutant_avg REAL,
            pollutant_max REAL
        )
    ''')
    
    # Table 2: Current Weather Logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature_c REAL,
            humidity_percent REAL,
            pressure_hpa REAL,
            wind_speed_m_s REAL,
            wind_direction_deg REAL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("🗄️ VayuVision Database Architecture Initialized Successfully.")

def save_current_data():
    """Fetches live streams from ingestion engines and appends them to SQL tables."""
    conn = sqlite3.connect(DB_PATH)
    
    print("\n📡 Database Worker: Initiating live pipelines...")
    
    # 1. Pull and process CPCB Data
    cpcb_df = fetch_cpcb_data()
    if not cpcb_df.empty:
        # Map out the exact columns we need to persist
        target_cols = ['station', 'pollutant_id', 'pollutant_min', 'pollutant_avg', 'pollutant_max']
        valid_cols = [col for col in target_cols if col in cpcb_df.columns]
        
        clean_cpcb = cpcb_df[valid_cols].copy()
        
        # Write to SQLite
        clean_cpcb.to_sql('ground_sensors', conn, if_exists='append', index=False)
        print(f"✅ Database Saved: {len(clean_cpcb)} ground sensor records appended.")
    
    # 2. Pull and process Weather Data
    center_lat = (MIN_LAT + MAX_LAT) / 2
    center_lon = (MIN_LON + MAX_LON) / 2
    weather_data = fetch_weather_data(center_lat, center_lon)
    
    if weather_data:
        weather_df = pd.DataFrame([weather_data])
        weather_df.to_sql('weather_logs', conn, if_exists='append', index=False)
        print("✅ Database Saved: Current weather snapshot appended.")
        
    conn.close()
    print("🏁 Data pipeline iteration complete. Database connection closed safely.")

if __name__ == "__main__":
    init_db()
    save_current_data()