# Solar Power Generation Forecast

## 프로젝트 개요
태양광 발전량 예측 모델 개발 프로젝트입니다.

## 사용 모델
- LightGBM
- XGBoost
- LSTM

## 데이터
- Kaggle Solar Dataset
- Weather Sensor Data

## Feature Engineering
- Lag features (AC_POWER_LAG)
- Rolling mean/std
- Irradiation 기반 feature
- Time-based features (sin/cos)

## 성능 비교
| Model | MAE | RMSE | R² |
|------|-----|------|----|
| LightGBM | ~52 | ~140 | ~0.75 |
| XGBoost | ~53 | ~142 | ~0.74 |
| LSTM | ~55 | - | - |

## 향후 계획
- 실제 발전소 raw 데이터 적용
- 기상청 예보 데이터 적용
- feature 개선