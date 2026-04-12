from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib


app = FastAPI()

model = joblib.load("lightgbm_generation_model.pkl")


class GenerationRequest(BaseModel):
    plant_id: str
    datetime: str
    irradiation: float
    ambient_temperature: float
    module_temperature: float
    wind_speed: float
    humidity: float


class AnomalyRequest(BaseModel):
    panel_id: str
    plant_id: str
    datetime: str
    actual_power: float
    predicted_power: float
    irradiation: float
    ambient_temperature: float
    module_temperature: float


def make_prediction_input(req: GenerationRequest) -> pd.DataFrame:
    dt = pd.to_datetime(req.datetime)

    row = {
        "IRRADIATION": req.irradiation,
        "AMBIENT_TEMPERATURE": req.ambient_temperature,
        "MODULE_TEMPERATURE": req.module_temperature,
        "HOUR": dt.hour,
        "DAY": dt.day,
        "MONTH": dt.month,
        "WEEKDAY": dt.weekday()
    }

    return pd.DataFrame([row])


@app.get("/")
def root():
    return {
        "status": "success",
        "code": 200,
        "message": "Solar AI API is running"
    }


@app.post("/api/v1/predict/generation")
def predict_generation_api(req: GenerationRequest):
    X_input = make_prediction_input(req)
    pred = model.predict(X_input)[0]
    pred = max(float(pred), 0.0)

    return {
        "status": "success",
        "code": 200,
        "data": {
            "plant_id": req.plant_id,
            "predicted_ac_power": round(pred, 2),
            "confidence": 0.90,
            "drift_detected": False
        }
    }


@app.post("/api/v1/detect/anomaly")
def detect_anomaly(req: AnomalyRequest):
    error = abs(req.actual_power - req.predicted_power)
    ratio = req.actual_power / req.predicted_power if req.predicted_power > 0 else 0

    is_anomaly = ratio < 0.7
    anomaly_score = min(1.0, error / (req.predicted_power + 1e-6))

    if anomaly_score >= 0.7:
        severity = "HIGH"
    elif anomaly_score >= 0.4:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    recommendation = "패널 점검 필요" if is_anomaly else "정상 상태"

    return {
        "status": "success",
        "code": 200,
        "data": {
            "panel_id": req.panel_id,
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_score, 2),
            "severity": severity,
            "recommendation": recommendation
        }
    }