# Solar Power Prediction & Anomaly Detection AI

## 프로젝트 개요

본 프로젝트는 태양광 발전소의 발전량을 예측하고,
예측값과 실제 발전량의 차이를 기반으로 이상 상태를 탐지하는 AI 시스템 개발을 목표로 한다.

기상 데이터와 패널 이상 feature를 결합하여 발전량 예측 성능을 향상시켰으며,
Regression 기반 이상 탐지와 Classification 기반 이상 판단을 결합한 Hybrid 구조를 적용하였다.

또한 SHAP 기반 XAI(Explainable AI)를 활용하여
모델이 이상 상태를 판단한 원인을 설명할 수 있도록 구현하였다.

---

# 프로젝트 구조

```text
기상 데이터 + 패널 Feature
        ↓
LightGBM 발전량 예측
        ↓
예측값 vs 실제값 비교
        ↓
오차(ERROR) 계산
        ↓
Anomaly Detection
        ↓
Classification / Hybrid Detection
        ↓
SHAP 기반 XAI 설명
```

---

# 사용 데이터

## 발전량 및 기상 데이터

- GEN_KWH
- IRRADIANCE
- MODULE_TEMP
- HUMIDITY
- CLOUD
- H_SIN / H_COS
- 계절성 feature

## 패널 이상 Feature

- dust_coverage_ratio
- snow_coverage_ratio
- bird_dropping_count
- physical_damage_count
- max_defect_confidence
- cls_normal
- cls_dust
- cls_snow
- cls_bird
- cls_damage

---

# 사용 모델

## 발전량 예측
- LightGBM Regressor

## 이상 감지
- Regression 기반 Error Detection
- Classification 기반 Anomaly Detection
- Hybrid Detection

## XAI
- SHAP (SHapley Additive exPlanations)

---

# 모델 성능

| 모델 | MAE | RMSE | R² |
|---|---|---|---|
| Baseline LightGBM | 29.69 | 59.73 | 0.935 |
| Panel Feature 추가 | 32.08 | 60.76 | 0.928 |
| Tuned LightGBM | 26.11 | 50.05 | 0.951 |

---

# 이상 감지 방식

본 시스템은 단순 발전량 감소를 이상으로 판단하지 않는다.

일사량, 시간대, 계절성 등의 기상 조건을 고려하여
정상적인 예상 발전량을 먼저 예측하고,
실제 발전량이 예측값 대비 비정상적으로 낮은 경우 이상 상태로 판단한다.

## 위험도 기준

- MEDIUM : 예측값 대비 15% 이상 차이
- HIGH : 예측값 대비 30% 이상 차이

---

# Hybrid Anomaly Detection

Regression 기반 예측 오차 탐지와
Classification 기반 이상 분류 결과를 결합하여
Hybrid 이상 감지 구조를 구성하였다.

두 모델 중 하나라도 이상으로 판단할 경우
최종 이상 상태로 분류한다.

---

# XAI (Explainable AI)

SHAP 기반 XAI를 활용하여
모델이 발전량 이상 상태를 판단한 주요 원인을 시각화하였다.

## 주요 설명 Feature 예시

- IRRADIANCE
- GEN_LAG_1
- H_COS
- SEASONAL_SOLAR_PATTERN

---

# 생성 결과 파일

```text
wooyang_merged_result_panel.csv
wooyang_anomaly_result_panel.csv
wooyang_anomaly_top20_panel.csv
wooyang_anomaly_classification_result.csv
wooyang_hybrid_anomaly_result.csv
wooyang_shap_feature_importance.csv
```

---

# 향후 개선 방향

- TIME 기반 패널 이미지 연동
- YOLO 기반 비전 이상 탐지 연계
- 실시간 API 기반 추론 시스템
- Dashboard 기반 실시간 모니터링
- Dynamic Threshold 기반 이상 감지 고도화

---

# 기술 스택

- Python
- Pandas
- NumPy
- LightGBM
- Scikit-learn
- SHAP
- Matplotlib