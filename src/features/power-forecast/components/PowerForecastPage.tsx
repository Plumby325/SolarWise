import { useEffect, useMemo, useState } from 'react'
import type { EChartsCoreOption } from 'echarts/core'
import { getForecast, getMeasurements } from '@/api'
import type { ForecastPoint, MeasurementPoint } from '@/api'
import {
  FORECAST_CHART_DUMMY_MESSAGE,
  FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS,
  type ForecastHorizonId,
  buildForecastComboChartOption,
  createDummyBridgeMeasurements,
  createDummyForecastSeries,
  filterForecastsByHorizon,
  isForecastChartDummyForced,
} from '@/shared/charts/forecastComboChartOption'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { EChart } from '@/shared/ui/EChart'
import { formatLocalDateTimeForApi } from '@/shared/utils/dateFormat'
import styles from './PowerForecastPage.module.css'

const periodFilters: Array<{ id: ForecastHorizonId; label: string }> = [
  { id: 'today', label: '오늘' },
  { id: '2d', label: '2일' },
  { id: '3d', label: '3일' },
]

const summaryCards = [
  {
    label: '금일 예측 발전량',
    value: '482.6',
    unit: 'kWh',
    note: '현재 기준 예측',
    trend: '↓ -10.3%',
    icon: '📅',
    tone: 'blue',
  },
  {
    label: '예측 신뢰도',
    value: '91',
    unit: '%',
    note: 'XGBoost 모델 기준',
    trend: '높음',
    icon: '✓',
    tone: 'green',
  },
  {
    label: '주요 영향 요인',
    value: '일사량',
    unit: '',
    note: 'SHAP 기여도 1위',
    trend: '운량↑ 예상',
    icon: '☀',
    tone: 'amber',
  },
] as const

const shapFactors = [
  { title: '일사량', description: '맑음 예보로 발전에 긍정적', value: '+0.52', size: '52%', tone: 'blue', direction: '↑' },
  { title: '운량', description: '오후 구름 증가로 출력 감소 예상', value: '-0.38', size: '38%', tone: 'red', direction: '↓' },
  { title: '기온', description: '적정 온도 유지로 효율 양호', value: '+0.21', size: '21%', tone: 'green', direction: '↑' },
  { title: '패널 상태', description: '오염 지수 소폭 영향', value: '-0.12', size: '12%', tone: 'amber', direction: '↓' },
  { title: '습도', description: '낮은 습도 유지', value: '+0.08', size: '8%', tone: 'green', direction: '↑' },
] as const

const weatherCards = [
  { label: '일사량', value: '702 W/m²', note: '어제 대비 +8%', icon: '☀', tone: 'amber' },
  { label: '최고 기온', value: '24.5°C', note: '적정 발전 온도', icon: '🌡', tone: 'red' },
  { label: '운량', value: '30%', note: '오후 60%↑', icon: '☁', tone: 'gray' },
  { label: '습도', value: '42%', note: '낮음 (발전 양호)', icon: '💧', tone: 'blue' },
] as const

export function PowerForecastPage() {
  const { defaultPlantId } = useDefaultPlant()
  const isDummyForced = isForecastChartDummyForced()
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizonId>('2d')
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [forecastError, setForecastError] = useState('')
  const [bridgeMeasurements, setBridgeMeasurements] = useState<MeasurementPoint[]>([])
  const [bridgeError, setBridgeError] = useState('')

  useEffect(() => {
    if (!defaultPlantId) {
      setForecasts([])
      setForecastError('발전소 데이터 없음')
      return
    }
    if (isDummyForced) {
      setForecasts(createDummyForecastSeries())
      setForecastError(FORECAST_CHART_DUMMY_MESSAGE)
      return
    }

    let isActive = true

    const fetchForecasts = () => {
      getForecast(defaultPlantId)
        .then((res) => {
          if (!isActive) {
            return
          }
          const hasData = res.data.forecast_series.length > 0
          setForecasts(hasData ? res.data.forecast_series : createDummyForecastSeries())
          setForecastError(hasData ? '' : '예측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }
          console.error('발전량 예측 조회 실패:', error)
          setForecasts(createDummyForecastSeries())
          setForecastError(`${error instanceof Error ? error.message : '예측 API 조회 실패'} · 더미 데이터 표시 중`)
        })
    }

    fetchForecasts()
    const timer = window.setInterval(fetchForecasts, 30000)

    return () => {
      isActive = false
      window.clearInterval(timer)
    }
  }, [defaultPlantId, isDummyForced])

  useEffect(() => {
    if (!defaultPlantId) {
      setBridgeMeasurements([])
      setBridgeError('발전소 데이터 없음')
      return
    }
    if (isDummyForced) {
      setBridgeMeasurements(createDummyBridgeMeasurements())
      setBridgeError(FORECAST_CHART_DUMMY_MESSAGE)
      return
    }

    let isActive = true

    const fetchBridge = () => {
      const to = new Date()
      const from = new Date(to.getTime() - FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS)

      getMeasurements(defaultPlantId, formatLocalDateTimeForApi(from), formatLocalDateTimeForApi(to))
        .then((res) => {
          if (!isActive) {
            return
          }
          const hasData = res.data.series.length > 0
          setBridgeMeasurements(hasData ? res.data.series : createDummyBridgeMeasurements())
          setBridgeError(hasData ? '' : '계측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }
          console.error('예측 차트용 계측 조회 실패:', error)
          setBridgeMeasurements(createDummyBridgeMeasurements())
          setBridgeError(`${error instanceof Error ? error.message : '계측 API 조회 실패'} · 더미 데이터 표시 중`)
        })
    }

    fetchBridge()
    const timer = window.setInterval(fetchBridge, 5000)

    return () => {
      isActive = false
      window.clearInterval(timer)
    }
  }, [defaultPlantId, isDummyForced])

  const filteredForecasts = useMemo(
    () => filterForecastsByHorizon(forecasts, forecastHorizon),
    [forecastHorizon, forecasts],
  )

  const chartOption = useMemo<EChartsCoreOption>(
    () =>
      buildForecastComboChartOption({
        bridgeMeasurements,
        forecasts: filteredForecasts,
        bridgeError,
        forecastError,
      }),
    [bridgeError, bridgeMeasurements, forecastError, filteredForecasts],
  )

  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="forecast" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>발전량 예측</h1>
            <p>XGBoost 기반 AI 모델 · 기상청 API 연동</p>
          </div>

          <div className={styles.periodControls} aria-label="예측 기간">
            <span>예측 기간</span>
            {periodFilters.map((filter) => (
              <button
                key={filter.id}
                className={forecastHorizon === filter.id ? styles.periodActive : undefined}
                type="button"
                onClick={() => setForecastHorizon(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="발전량 예측 요약">
          {summaryCards.map((card) => (
            <article key={card.label} className={[styles.summaryCard, styles[card.tone]].join(' ')}>
              <div>
                <p>{card.label}</p>
                <strong>
                  {card.value}
                  {card.unit ? <span>{card.unit}</span> : null}
                </strong>
              </div>
              <span className={styles.summaryIcon} aria-hidden="true">{card.icon}</span>
              <footer>
                <span>{card.note}</span>
                <em>{card.trend}</em>
              </footer>
            </article>
          ))}
        </section>

        <section className={styles.chartPanel} aria-labelledby="forecast-chart-title">
          <div className={styles.panelHeader}>
            <div>
              <h2 id="forecast-chart-title">2~3일 발전량 예측</h2>
              <p>{forecastError || bridgeError || 'XGBoost 기반 · 실측 + 예측 · 대시보드와 동일 차트'}</p>
            </div>
            <span className={styles.aiBadge}>AI Powered</span>
            <div className={styles.unitControls} aria-label="데이터 단위">
              <span>데이터 단위</span>
              <button type="button" className={styles.unitActive} disabled>
                시간별
              </button>
              <button type="button" disabled title="준비 중">
                일별
              </button>
            </div>
          </div>

          <div className={styles.forecastEChartWrap}>
            <EChart
              ariaLabel="2~3일 발전량 예측 ECharts"
              className={styles.forecastPageEChart}
              option={chartOption}
            />
          </div>
        </section>

        <div className={styles.detailGrid}>
          <section className={styles.panel} aria-labelledby="shap-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="shap-title">SHAP 피처 기여도</h2>
                <p>내일 예측에 영향을 미친 요인 분석</p>
              </div>
            </div>

            <div className={styles.shapList}>
              {shapFactors.map((factor) => (
                <article key={factor.title} className={styles.shapItem}>
                  <header>
                    <div>
                      <h3>{factor.title}</h3>
                      <p>{factor.description}</p>
                    </div>
                    <span className={styles[factor.tone]}>{factor.direction}</span>
                  </header>
                  <div className={styles.shapBar}>
                    <span className={styles[factor.tone]} style={{ width: factor.size }} />
                  </div>
                  <strong className={styles[factor.tone]}>{factor.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="weather-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="weather-title">예측 근거 및 기상 정보</h2>
                <p>기상청 API 연동 기준</p>
              </div>
            </div>

            <div className={styles.weatherGrid}>
              {weatherCards.map((card) => (
                <article key={card.label} className={[styles.weatherCard, styles[card.tone]].join(' ')}>
                  <span aria-hidden="true">{card.icon}</span>
                  <p>{card.label}</p>
                  <strong>{card.value}</strong>
                  <small>{card.note}</small>
                </article>
              ))}
            </div>

            <article className={styles.aiSummary}>
              <h3>AI 예측 요약</h3>
              <p>
                운량 증가와 일사량 감소가 내일 예측 발전량 하락에 가장 큰 영향을 주었습니다.
                <br />
                <br />
                오전(09-12시) 최대 85kW 예상,
                <br />
                오후(13-17시) 구름 영향으로 58kW로 하락 예측.
              </p>
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
