import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

# Create a folder to store the trained model
os.makedirs('ml_models/saved_models', exist_ok=True)

def train_model():
    print("🧠 Initializing VayuVision XGBoost AI Training Sequence...\n")

    # 1. Load the synthetic historical data
    data_path = r'D:\ET Hackathon\data\hyderabad_6month_history.csv'
    if not os.path.exists(data_path):
        print(f"❌ Error: Cannot find {data_path}. Run dummy_data_gen.py first.")
        return

    df = pd.read_csv(data_path)
    
    # 2. Define Features (Inputs) and Target (Output)
    # We drop the timestamp because the AI only cares about the physical conditions
    X = df[['temperature_c', 'humidity_percent', 'wind_speed_m_s']]
    y = df['target_aqi']

    # 3. Split the data (80% for studying, 20% for testing the AI like an exam)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"📊 Training on {len(X_train)} records. Testing on {len(X_test)} records...")

    # 4. Build the XGBoost Model
    model = xgb.XGBRegressor(
        n_estimators=200,      # Number of decision trees
        learning_rate=0.05,    # How fast the model adapts
        max_depth=5,           # Complexity of each tree
        random_state=42
    )

    # 5. Train the Model (The actual "learning" phase)
    print("⏳ Training model... (This usually takes a few seconds)")
    model.fit(X_train, y_train)

    # 6. Evaluate the Model (The Exam)
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print("\n✅ Training Complete! Model Evaluation Metrics:")
    print(f"   - Mean Absolute Error (MAE): {mae:.2f} AQI points")
    print(f"   - Accuracy Score (R2): {r2:.2f} (1.0 is perfect)")
    print("   *(Tell the judges: 'Our model predicts the future AQI with an average error margin of just +/- " + str(round(mae, 1)) + " points!')*")

    # 7. Save the Brain to a file so we can use it later
    model_file = 'ml_models/saved_models/xgboost_aqi_model.pkl'
    joblib.dump(model, model_file)
    print(f"\n💾 Model successfully saved to: {model_file}")

if __name__ == "__main__":
    train_model()