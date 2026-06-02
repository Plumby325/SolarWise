from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import shap

app = FastAPI()

# 프론트 연결 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드
model = joblib.load("wooyang_lightgbm_model_final.pkl")

# SHAP explainer 생성
#explainer = shap.TreeExplainer(model)

# LightGBM 실제 feature 31개
FEATURE_COLUMNS = [
    "H_SIN", "H_COS",
    "DOY_SIN", "DOY_COS",
    "TEMP", "HUMI", "CLOU", "WISP",
    "WIDE_SIN", "WIDE_COS",
    "SUN_ELEV_CLIP", "COS_ZEN",
    "IRRADIANCE",
    "EST_IRRADIANCE",
    "IRRADIANCE_PROXY",
    "IRRADIANCE_X_CAPA",
    "CAPA",
    "SEASONAL_SOLAR_PATTERN",
    "WEATHER_ADJUSTED_PATTERN",
    "EXPECTED_GEN_PROXY",
    "GEN_LAG_2",
    "dust_coverage_ratio",
    "snow_coverage_ratio",
    "bird_dropping_count",
    "physical_damage_count",
    "max_defect_confidence",
    "cls_normal",
    "cls_dust",
    "cls_snow",
    "cls_bird",
    "cls_damage"
]

FEATURE_LABELS = {
    "H_SIN": "시간 패턴",
    "H_COS": "시간 패턴",
    "DOY_SIN": "계절 패턴",
    "DOY_COS": "계절 패턴",
    "TEMP": "기온",
    "HUMI": "습도",
    "CLOU": "운량",
    "WISP": "풍속",
    "WIDE_SIN": "풍향",
    "WIDE_COS": "풍향",
    "SUN_ELEV_CLIP": "태양 고도",
    "COS_ZEN": "태양 천정각",
    "IRRADIANCE": "일사량",
    "EST_IRRADIANCE": "추정 일사량",
    "IRRADIANCE_PROXY": "일사량 proxy",
    "IRRADIANCE_X_CAPA": "일사량 × 설비용량",
    "CAPA": "설비용량",
    "SEASONAL_SOLAR_PATTERN": "계절 태양광 패턴",
    "WEATHER_ADJUSTED_PATTERN": "기상 보정 패턴",
    "EXPECTED_GEN_PROXY": "예상 발전량 proxy",
    "GEN_LAG_2": "이전 발전량",
    "dust_coverage_ratio": "먼지 오염 비율",
    "snow_coverage_ratio": "눈 덮임 비율",
    "bird_dropping_count": "조류 배설물 수",
    "physical_damage_count": "물리적 손상 수",
    "max_defect_confidence": "결함 탐지 신뢰도",
    "cls_normal": "정상 패널",
    "cls_dust": "먼지 오염",
    "cls_snow": "적설",
    "cls_bird": "조류 배설물",
    "cls_damage": "패널 손상"
}

@app.get("/")
def home():
    return {
        "message": "SolarWise AI Server Running",
        "feature_count": len(FEATURE_COLUMNS)
    }

@app.post("/api/v1/predict")
def predict(data: dict):
    try:
        row = {col: data.get(col, 0) for col in FEATURE_COLUMNS}
        df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

        prediction = model.predict(df)[0]

        return {
            "status": "success",
            "prediction": float(prediction),
            "feature_count": len(FEATURE_COLUMNS)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/v1/xai-report")
def xai_report(data: dict):
    try:
        row = {col: data.get(col, 0) for col in FEATURE_COLUMNS}
        df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

        prediction = float(model.predict(df)[0])
        actual = float(data.get("ACTUAL", 0))
        error = abs(actual - prediction)

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(df)[0]

        error_rate = 0
        if actual != 0:
            error_rate = round((error / actual) * 100, 2)

        top_idx = sorted(
            range(len(shap_values)),
            key=lambda i: abs(shap_values[i]),
            reverse=True
        )[:5]

        main_causes = []
        for i in top_idx:
            feature = FEATURE_COLUMNS[i]
            impact = float(shap_values[i])

            main_causes.append({
                "feature": feature,
                "label": FEATURE_LABELS.get(feature, feature),
                "impact": impact,
            })

        severity = "HIGH" if error_rate >= 20 else "NORMAL"

        return {
            "status": "success",
            "actual": actual,
            "prediction": prediction,
            "error": error,
            "error_rate": error_rate,
            "severity": severity,
            "summary": f"실제 발전량과 예측 발전량의 차이가 {error_rate}% 발생했습니다.",
            "main_causes": main_causes,
            "recommendations": [
                "패널 표면 오염 여부 확인",
                "인버터 연결 상태 점검",
                "일사량 센서 데이터 확인"
            ]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }