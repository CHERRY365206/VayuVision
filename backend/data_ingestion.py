import os
import requests
import pandas as pd
import numpy as np
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

CPCB_API_KEY = os.getenv("CPCB_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_BASE_URL = os.getenv("WEATHER_BASE_URL")
WEATHER_FORECAST_URL = os.getenv("WEATHER_FORECAST_URL", "http://api.openweathermap.org/data/2.5/forecast")

MIN_LAT = float(os.getenv("MIN_LAT", 17.20))
MAX_LAT = float(os.getenv("MAX_LAT", 17.55))
MIN_LON = float(os.getenv("MIN_LON", 78.25))
MAX_LON = float(os.getenv("MAX_LON", 78.60))

def fetch_weather_data(lat, lon):
    """Fetches real-time weather data for a coordinate using OpenWeatherMap."""
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": WEATHER_API_KEY,
            "units": "metric"
        }
        response = requests.get(WEATHER_BASE_URL, params=params)
        response.raise_for_status() 
        data = response.json()
        
        return {
            "temperature_c": data["main"]["temp"],
            "humidity_percent": data["main"]["humidity"],
            "pressure_hpa": data["main"]["pressure"],
            "wind_speed_m_s": data["wind"]["speed"],
            "wind_direction_deg": data["wind"].get("deg", 0)
        }
    except Exception as e:
        print(f"❌ Weather API Error: {e}")
        return None
    
def fetch_weather_forecast(lat, lon):
    """
    Fetches the 72-hour weather forecast (in 3-hour intervals) for a coordinate.
    Crucial for training the predictive AQI model.
    """
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": WEATHER_API_KEY,
            "units": "metric"
        }
        response = requests.get(WEATHER_FORECAST_URL, params=params)
        response.raise_for_status() 
        data = response.json()
        
        forecast_records = []
        # The API returns 5 days of data every 3 hours. 
        # We only need 72 hours, which is exactly 24 intervals (24 * 3 = 72).
        for item in data.get("list", [])[:24]:
            forecast_records.append({
                "target_time": item["dt_txt"],
                "forecast_temp_c": item["main"]["temp"],
                "forecast_humidity": item["main"]["humidity"],
                "forecast_wind_speed": item["wind"]["speed"],
                "forecast_wind_dir": item["wind"].get("deg", 0)
            })
            
        return pd.DataFrame(forecast_records)

    except Exception as e:
        print(f"❌ Forecast API Error: {e}")
        return pd.DataFrame()

def generate_mock_hyderabad_data():
    """
    Fallback function generating realistic CAAQMS data for Hyderabad stations
    to ensure local pipeline building is never blocked by external server downtime.
    """
    print("⚠️ Activating Fallback Engine: Generating realistic Hyderabad sensor matrix...")
    stations = ["Sanathnagar, Hyderabad", "Zoo Park, Hyderabad", "Bollaram, Hyderabad", "Central University, Hyderabad"]
    pollutants = ["PM2.5", "PM10", "NO2", "NH3", "SO2", "CO", "OZONE"]
    
    mock_records = []
    for station in stations:
        for p in pollutants:
            avg_val = np.random.uniform(30, 85) if p in ["PM2.5", "PM10"] else np.random.uniform(10, 40)
            mock_records.append({
                "country": "India",
                "state": "Telangana",
                "city": "Hyderabad",
                "station": station,
                "last_update": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                "pollutant_id": p,
                "pollutant_avg": round(avg_val, 1),
                "pollutant_max": round(avg_val * np.random.uniform(1.2, 1.5), 1),
                "pollutant_min": round(avg_val * np.random.uniform(0.6, 0.8), 1),
                "pollutant_unit": "mg/m3" if p == "CO" else "ug/m3"
            })
    return pd.DataFrame(mock_records)

def fetch_cpcb_data():
    """Fetches live sensor data by directly filtering the API for Hyderabad with custom browser headers."""
    cpcb_url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
    try:
        params = {
            "api-key": CPCB_API_KEY,
            "format": "json",
            "filters[city]": "Hyderabad", 
            "limit": 100 
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        response = requests.get(cpcb_url, params=params, headers=headers, timeout=12)
        response.raise_for_status()
        
        data = response.json()
        df = pd.DataFrame(data.get("records", []))
        
        if df.empty:
            print("⚠️ API returned empty for Hyderabad. Switching to fallback.")
            return generate_mock_hyderabad_data()
            
        # =========================================================
        # SCHEMA NORMALIZATION: Catching the government API changes
        # =========================================================
        if 'avg_value' in df.columns:
            df.rename(columns={
                'min_value': 'pollutant_min',
                'max_value': 'pollutant_max',
                'avg_value': 'pollutant_avg'
            }, inplace=True)
            
        print("✅ Successfully pulled LIVE government data for Hyderabad!")
        return df

    except Exception as e:
        print(f"❌ CPCB Connection Failed ({e}). Switching to local matrix.")
        return generate_mock_hyderabad_data()

# ==========================================
# 🚀 EXECUTION & TESTING BLOCK
# ==========================================
if __name__ == "__main__":
    print("--- VayuVision Data Ingestion Engine ---")
    print(f"Target Box: {MIN_LAT} to {MAX_LAT} Lat, {MIN_LON} to {MAX_LON} Lon\n")
    
    # 1. Test Weather API
    center_lat = (MIN_LAT + MAX_LAT) / 2
    center_lon = (MIN_LON + MAX_LON) / 2
    
    print("Fetching Meteorological Data...")
    weather = fetch_weather_data(center_lat, center_lon)
    if weather:
        print("✅ Weather Data Retrieved Successfully:")
        for key, value in weather.items():
            print(f"   - {key}: {value}")
            
    print("\n----------------------------------------\n")
            
    # 2. Test CPCB API
    print("Fetching CPCB Ground Sensor Data...")
    cpcb_data = fetch_cpcb_data()
    print(f"\n📊 Processed {len(cpcb_data)} sensor attributes for VayuVision mapping.")
    
    # Clean check to handle discrepancies between the live data structure and the mock structure
    # Clean check to handle discrepancies between the live data structure and the mock structure
    available_cols = cpcb_data.columns
    display_cols = [col for col in ['station', 'pollutant_id', 'pollutant_min', 'pollutant_avg', 'pollutant_max'] if col in available_cols]
    
    if len(display_cols) > 0:
        print(cpcb_data[display_cols].head(10))
    else:
        print(cpcb_data.head(5))

    # 3. Test 72-Hour Forecast API
    print("\nFetching 72-Hour Meteorological Forecast...")
    forecast_data = fetch_weather_forecast(center_lat, center_lon)
    if not forecast_data.empty:
        print(f"✅ Successfully retrieved {len(forecast_data)} future time-steps.")
        print(forecast_data.head(5))