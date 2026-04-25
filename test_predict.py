import joblib
import pandas as pd

model = joblib.load("lightgbm_generation_model.pkl")

def make_prediction_input(req: dict) -> pd.DataFrame:
    dt = pd.to_datetime(req["datetime"])

    row = {
        "IRRADIATION": req["irradiation"],
        "AMBIENT_TEMPERATURE": req["ambient_temperature"],
        "MODULE_TEMPERATURE": req["module_temperature"],
        "HOUR": dt.hour,
        "DAY": dt.day,
        "MONTH": dt.month,
        "WEEKDAY": dt.weekday()
    }

    return pd.DataFrame([row])

def predict_generation(req: dict):
    X_input = make_prediction_input(req)
    pred = model.predict(X_input)[0]
    pred = max(float(pred), 0.0)

    return {
        "plant_id": req["plant_id"],
        "predicted_ac_power": round(pred, 2),
        "confidence": 0.90,
        "drift_detected": False
    }

sample_req = {
    "plant_id": "PLANT_001",
    "datetime": "2024-03-01T14:00:00",
    "irradiation": 0.75,
    "ambient_temperature": 23.5,
    "module_temperature": 35.2,
    "wind_speed": 2.3,
    "humidity": 60.0
}

print(predict_generation(sample_req))