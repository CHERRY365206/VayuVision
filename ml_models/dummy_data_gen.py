import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

# Ensure we are saving inside the ml_models folder
os.makedirs('ml_models', exist_ok=True)

def generate_synthetic_data(days=180):
    """
    Generates realistic hourly weather and AQI data for model training.
    """
    print(f"🧠 Generating {days} days of synthetic historical data for Hyderabad...")
    
    # 1. Generate Timestamps (Hourly for the last 6 months)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    timestamps = pd.date_range(start=start_date, end=end_date, freq='h') # lowercase 'h' for hourly frequency
    
    n_samples = len(timestamps)
    
    # 2. Generate Weather Features (Realistic ranges for Hyderabad)
    temperature_c = np.random.normal(loc=30, scale=5, size=n_samples).clip(15, 45)
    humidity_percent = np.random.normal(loc=55, scale=15, size=n_samples).clip(20, 95)
    wind_speed_m_s = np.random.normal(loc=4, scale=2, size=n_samples).clip(0.1, 15)
    
    # 3. Formulate the Target AQI (The logic the AI needs to learn)
    # High Temp -> Slight increase in chemical reactions (Ozone)
    # High Humidity -> Traps particulate matter (PM2.5/PM10)
    # High Wind -> Blows pollution away (Strong negative correlation)
    
    base_aqi = 85
    temp_effect = (temperature_c - 30) * 1.5
    humidity_effect = (humidity_percent - 50) * 0.8
    wind_effect = (wind_speed_m_s - 4) * -12  # Wind is the strongest factor
    
    # Add random noise to simulate unpredictable city emissions (traffic jams, etc.)
    noise = np.random.normal(0, 15, size=n_samples) 
    
    synthetic_aqi = (base_aqi + temp_effect + humidity_effect + wind_effect + noise).clip(20, 450)
    
    # 4. Compile into a clean Pandas DataFrame
    df = pd.DataFrame({
        'timestamp': timestamps,
        'temperature_c': np.round(temperature_c, 1),
        'humidity_percent': np.round(humidity_percent, 1),
        'wind_speed_m_s': np.round(wind_speed_m_s, 1),
        'target_aqi': np.round(synthetic_aqi, 0)
    })
    
    # 5. Save to CSV for the AI to consume later
    file_path = os.path.join('ml_models', 'historical_training_data.csv')
    df.to_csv(file_path, index=False)
    
    print(f"✅ Success! Generated {n_samples} historical records.")
    print(f"📁 Saved to: {file_path}")
    print("\nPreview of the matrix the AI will learn from:")
    print(df.head())

if __name__ == "__main__":
    generate_synthetic_data()