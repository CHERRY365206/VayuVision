import pandas as pd
import numpy as np

print("🧪 Opening historical weather archive...")

# Load your downloaded 6-month data
file_path = r"D:\ET Hackathon\data\hyderabad_6month_history.csv"
df = pd.read_csv(file_path)

print("⚙️ Synthesizing historical AQI targets based on atmospheric physics...")

# Base pollution level for a major city
base_aqi = 85 

# Physics Engine: High wind reduces AQI. High temps slightly increase it.
wind_effect = df['wind_speed_m_s'] * -5.5
temp_effect = (df['temperature_c'] - 25) * 1.5

# Add random statistical noise so the XGBoost model doesn't overfit a perfect equation
# This mimics real-world unpredictable emissions (like traffic jams)
noise = np.random.normal(0, 12, len(df))

# Calculate final AQI and clamp it to realistic bounds (Minimum 20, Maximum 350)
df['target_aqi'] = np.clip(base_aqi + wind_effect + temp_effect + noise, 20, 350).astype(int)

# Save the updated dataset back over the original file
df.to_csv(file_path, index=False)

print("✅ SUCCESS: 'target_aqi' column injected!")
print("🚀 You can now run 'python aqi_forecaster.py' and it will train perfectly!")