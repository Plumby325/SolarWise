# inference.py

import joblib
import pandas as pd

MODEL_PATH = "wooyang_lightgbm_model_final.pkl"

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

model = joblib.load(MODEL_PATH)

def predict_generation(input_data: dict):
    row = {col: input_data.get(col, 0) for col in FEATURE_COLUMNS}
    df = pd.DataFrame([row], columns=FEATURE_COLUMNS)

    prediction = model.predict(df)[0]

    return {
        "prediction": float(prediction),
        "feature_count": len(FEATURE_COLUMNS)
    }


# 테스트 실행용
if __name__ == "__main__":
    sample = {
        "H_SIN": -0.259,
        "H_COS": -0.966,
        "DOY_SIN": 0.75,
        "DOY_COS": 0.66,
        "TEMP": 23.4,
        "HUMI": 61.2,
        "CLOU": 0.4,
        "WISP": 2.1,
        "WIDE_SIN": -0.122,
        "WIDE_COS": 0.993,
        "SUN_ELEV_CLIP": 0.71,
        "COS_ZEN": 0.64,
        "IRRADIANCE": 710,
        "EST_IRRADIANCE": 690,
        "IRRADIANCE_PROXY": 700,
        "IRRADIANCE_X_CAPA": 560,
        "CAPA": 800,
        "SEASONAL_SOLAR_PATTERN": 0.758,
        "WEATHER_ADJUSTED_PATTERN": 0.83,
        "EXPECTED_GEN_PROXY": 520,
        "GEN_LAG_2": 663,
        "dust_coverage_ratio": 0.32,
        "snow_coverage_ratio": 0,
        "bird_dropping_count": 1,
        "physical_damage_count": 0,
        "max_defect_confidence": 0.82,
        "cls_normal": 0,
        "cls_dust": 1,
        "cls_snow": 0,
        "cls_bird": 0,
        "cls_damage": 0
    }

    result = predict_generation(sample)
    print(result)