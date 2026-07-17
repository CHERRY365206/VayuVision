import requests
import pandas as pd
import pickle
import json
import os

print("🔮 Initializing VayuVision Multi-Node Predictive Engine...")

# 1. Define the 5-Point City Grid
locations = {
    "center": {"lat": 17.3850, "lon": 78.4867},  # Hyderabad Center
    "north":  {"lat": 17.5140, "lon": 78.4670},  # Jeedimetla Industrial
    "south":  {"lat": 17.2543, "lon": 78.4385},  # Shamshabad
    "east":   {"lat": 17.4018, "lon": 78.5602},  # Uppal
    "west":   {"lat": 17.4483, "lon": 78.3915}   # HITEC City
}

# Construct batch API URL
lats = ",".join(str(loc["lat"]) for loc in locations.values())
lons = ",".join(str(loc["lon"]) for loc in locations.values())

print("📡 Fetching localized 72-hour meteorological matrix for 5 city zones...")
url = (
    f"https://api.open-meteo.com/v1/forecast?"
    f"latitude={lats}&longitude={lons}&"
    f"hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&"
    f"timezone=Asia%2FKolkata&forecast_days=3"
)

try:
    response = requests.get(url)
    response.raise_for_status()
    batch_data = response.json()
except Exception as e:
    print(f"❌ Forecast API Error: {e}")
    exit()

# 2. Load Your Trained Model
try:
    model_path = r"D:\ET Hackathon\ml_models\saved_models\xgboost_aqi_model.pkl"
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print("🧠 XGBoost Model loaded successfully.")
except Exception as e:
    print(f"❌ Model Load Error: {e}")
    exit()

print("⚙️ Running multi-threaded inference on all city sectors...")

# 3. Process each location and store predictions
# batch_data is an array of 5 locations in the exact order we requested them
zone_names = list(locations.keys())
master_predictions = {}

for idx, zone in enumerate(zone_names):
    zone_data = batch_data[idx]
    
    # Format into DataFrame exactly matching training features
    df_predict = pd.DataFrame({
        "temperature_c": zone_data["hourly"]["temperature_2m"],
        "humidity_percent": zone_data["hourly"]["relative_humidity_2m"],
        "wind_speed_m_s": zone_data["hourly"]["wind_speed_10m"]
    })
    
    # Run Inference for this specific zone
    zone_preds = model.predict(df_predict)
    master_predictions[zone] = zone_preds

# 4. Compile the 3D Matrix for the Frontend
# We structure this so the UI timeline still works perfectly using 'predicted_aqi' (the average),
# but the raw node data is available inside the 'nodes' object for the map to use later.
output_data = []
timestamps = batch_data[0]["hourly"]["time"]

for hour_idx in range(len(timestamps)):
    # Gather this hour's predictions across all 5 zones
    hour_nodes = {}
    total_aqi = 0
    
    for zone in zone_names:
        # Enforce realistic baseline floor of 20
        zone_aqi = max(20, int(master_predictions[zone][hour_idx]))
        hour_nodes[zone] = zone_aqi
        total_aqi += zone_aqi
        
    # Calculate the true city-wide spatial average
    city_average = int(total_aqi / len(zone_names))
    
    output_data.append({
        "hour_offset": hour_idx,
        "timestamp": timestamps[hour_idx],
        "predicted_aqi": city_average, # Timeline uses this!
        "nodes": hour_nodes            # The Map can use this!
    })

# 5. Save to JSON
json_path = r"D:\ET Hackathon\data\forecast.json"
os.makedirs(os.path.dirname(json_path), exist_ok=True)

with open(json_path, "w") as f:
    json.dump(output_data, f, indent=4)

print(f"✅ Spatial Matrix Complete! Multi-Node 72-hour forecast saved to: {json_path}")