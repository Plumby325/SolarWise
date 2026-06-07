import { useEffect, useMemo, useState } from 'react'
import type { EChartsCoreOption } from 'echarts/core'
import { getForecast, getForecastExplanation, getMeasurements } from '@/api'
import type { ForecastPoint, MeasurementPoint, XaiExplanationPoint } from '@/api'
import {
  FORECAST_CHART_DUMMY_MESSAGE,
  FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS,
  type ForecastHorizonId,
  buildTimelineForecastChartOption,
  createDummyBridgeMeasurements,
  createDummyForecastSeries,
  isForecastChartDummyForced,
} from '@/shared/charts/forecastComboChartOption'
import { deriveShapFeatureContributions } from '@/shared/charts/xaiFeatureContributions'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { useDashboardTimeline } from '@/shared/hooks/useDashboardTimeline'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { EChart } from '@/shared/ui/EChart'
import { formatLocalDateTimeForApi } from '@/shared/utils/dateFormat'
import styles from './PowerForecastPage.module.css'

const periodFilters: Array<{ id: ForecastHorizonId; label: string }> = [
  { id: 'today', label: '오늘' },
  { id: '2d', label: '2일' },
  { id: '3d', label: '3일' },
]

type WeatherCardTone = 'amber' | 'red' | 'gray' | 'blue'

type WeatherCard = {
  label: string
  value: string
  note: string
  icon: string
  tone: WeatherCardTone
}

function parseBackendDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function isSameLocalDay(timestamp: number, reference: Date) {
  const date = new Date(timestamp)
  return (
    date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
  )
}

function inferForecastIntervalHours(points: ForecastPoint[]) {
  if (points.length < 2) {
    return 1
  }
  const sortedTimes = points
    .map((point) => parseBackendDateTime(point.target_time))
    .sort((a, b) => a - b)
  const diffs: number[] = []
  for (let index = 1; index < sortedTimes.length; index += 1) {
    const diff = sortedTimes[index] - sortedTimes[index - 1]
    if (diff > 0) {
      diffs.push(diff)
    }
  }

  if (diffs.length === 0) {
    return 1
  }

  return Math.max(0.25, Math.min(...diffs) / (60 * 60 * 1000))
}

function getTodayForecastEnergyKwh(points: ForecastPoint[]) {
  const now = new Date()
  const todayPoints = points.filter((point) => isSameLocalDay(parseBackendDateTime(point.target_time), now))
  if (todayPoints.length === 0) {
    return null
  }
  const intervalHours = inferForecastIntervalHours(todayPoints)
  const total = todayPoints.reduce((sum, point) => sum + point.predicted_power_kw * intervalHours, 0)
  return Number(total.toFixed(1))
}

function getAverageConfidencePercent(points: ForecastPoint[]) {
  const confidences = points.map((point) => point.confidence).filter((value): value is number => typeof value === 'number')
  if (confidences.length === 0) {
    return null
  }
  const average = confidences.reduce((sum, value) => sum + value, 0) / confidences.length
  return Math.round(average * 100)
}

function getAverageMetric(measurements: MeasurementPoint[], metric: 'irradiance' | 'temperature' | 'humidity') {
  const values = measurements
    .map((measurement) => measurement[metric])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (values.length === 0) {
    return null
  }

  const sum = values.reduce((acc, value) => acc + value, 0)
  return sum / values.length
}

function getFeatureMean(explanations: XaiExplanationPoint[], keys: string[]) {
  const values: number[] = []
  explanations.forEach((item) => {
    const source = item.feature_importance ?? item.shap_values ?? {}
    keys.forEach((key) => {
      const value = source[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        values.push(value)
      }
    })
  })

  if (values.length === 0) {
    return null
  }

  return values.reduce((acc, value) => acc + value, 0) / values.length
}

function formatSignedPercent(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function buildAiSummaryText(explanations: XaiExplanationPoint[], shapFeatureContributions: Array<{ label: string; value: number }>) {
  const textFromApi = explanations.find((item) => item.explanation_text?.trim())?.explanation_text?.trim()
    ?? explanations.find((item) => item.lime_explanation?.trim())?.lime_explanation?.trim()

  if (textFromApi) {
    return textFromApi
  }

  const topFactors = shapFeatureContributions.slice(0, 2)
  if (topFactors.length === 0) {
    return 'XAI 설명 데이터가 아직 없어 예측 근거를 준비 중입니다.'
  }

  const factorText = topFactors
    .map((factor) => `${factor.label}(${factor.value >= 0 ? '+' : ''}${factor.value.toFixed(2)})`)
    .join(', ')

  return `상위 SHAP 요인 ${factorText}을 중심으로 예측 결과를 계산했습니다.`
}

export function PowerForecastPage() {
  const { defaultPlantId } = useDefaultPlant()
  const isDummyForced = isForecastChartDummyForced()
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizonId>('2d')
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [xaiExplanations, setXaiExplanations] = useState<XaiExplanationPoint[]>([])
  const [forecastError, setForecastError] = useState('')
  const [bridgeMeasurements, setBridgeMeasurements] = useState<MeasurementPoint[]>([])
  const [bridgeError, setBridgeError] = useState('')
  const {
    timeline,
    error: timelineError,
    setRange,
    setFutureHours,
  } = useDashboardTimeline(defaultPlantId)

  useEffect(() => {
    setRange('DAY')
    const nextFutureHours = forecastHorizon === 'today' ? 24 : forecastHorizon === '2d' ? 48 : 72
    setFutureHours(nextFutureHours)
  }, [forecastHorizon, setFutureHours, setRange])

  useEffect(() => {
    if (!defaultPlantId) {
      setForecasts([])
      setXaiExplanations([])
      setForecastError('발전소 데이터 없음')
      return
    }
    if (isDummyForced) {
      setForecasts(createDummyForecastSeries())
      setXaiExplanations([])
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
          setXaiExplanations(Array.isArray(res.data.explanations) ? res.data.explanations : [])
          setForecastError(hasData ? '' : '예측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }
          console.error('발전량 예측 조회 실패:', error)
          setForecasts(createDummyForecastSeries())
          setXaiExplanations([])
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
    if (!defaultPlantId || isDummyForced) {
      return
    }

    let isActive = true
    getForecastExplanation(defaultPlantId)
      .then((res) => {
        if (!isActive) {
          return
        }
        if (res.data.explanations.length > 0) {
          setXaiExplanations(res.data.explanations)
        }
      })
      .catch(() => {
        if (!isActive) {
          return
        }
      })

    return () => {
      isActive = false
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

  const chartOption = useMemo<EChartsCoreOption>(
    () => buildTimelineForecastChartOption(timeline, timelineError || forecastError || bridgeError),
    [bridgeError, forecastError, timeline, timelineError],
  )
  const summaryCards = useMemo(() => {
    const todayKwh = getTodayForecastEnergyKwh(forecasts)
    const avgConfidence = getAverageConfidencePercent(forecasts)
    const shapFeatureContributions = deriveShapFeatureContributions(xaiExplanations)
    const majorFactor = shapFeatureContributions[0]

    return [
      {
        label: '금일 예측 발전량',
        value: todayKwh != null ? String(todayKwh) : '--',
        unit: 'kWh',
        note: '예측 API 기준 계산',
        trend: todayKwh != null ? 'API 반영' : '데이터 없음',
        icon: '📅',
        tone: 'blue',
      },
      {
        label: '예측 신뢰도',
        value: avgConfidence != null ? String(avgConfidence) : '--',
        unit: '%',
        note: '예측 포인트 평균 신뢰도',
        trend: avgConfidence == null ? '데이터 없음' : avgConfidence >= 90 ? '높음' : avgConfidence >= 75 ? '보통' : '낮음',
        icon: '✓',
        tone: 'green',
      },
      {
        label: '주요 영향 요인',
        value: majorFactor?.label ?? '--',
        unit: '',
        note: 'XAI 설명 API 기준',
        trend: majorFactor == null ? '데이터 없음' : `${majorFactor.value > 0 ? '↑' : '↓'} ${Math.abs(majorFactor.value).toFixed(2)}`,
        icon: '☀',
        tone: 'amber',
      },
    ] as const
  }, [forecasts, xaiExplanations])
  const shapFeatureContributions = useMemo(
    () => deriveShapFeatureContributions(xaiExplanations),
    [xaiExplanations],
  )
  const weatherCards = useMemo<WeatherCard[]>(() => {
    const irradiance = getAverageMetric(bridgeMeasurements, 'irradiance')
    const temperature = getAverageMetric(bridgeMeasurements, 'temperature')
    const humidity = getAverageMetric(bridgeMeasurements, 'humidity')
    const cloudImpact = getFeatureMean(xaiExplanations, ['cloud_cover', 'cloud'])

    return [
      {
        label: '일사량',
        value: irradiance == null ? '--' : `${Math.round(irradiance)} W/m²`,
        note: (() => {
          const shapValue = getFeatureMean(xaiExplanations, ['irradiance', 'solar_irradiance'])
          if (shapValue == null) {
            return '실측 평균 기준'
          }
          return `SHAP 영향 ${formatSignedPercent(shapValue * 100)}`
        })(),
        icon: '☀',
        tone: 'amber',
      },
      {
        label: '기온',
        value: temperature == null ? '--' : `${temperature.toFixed(1)}°C`,
        note: (() => {
          const shapValue = getFeatureMean(xaiExplanations, ['temperature', 'ambient_temperature'])
          if (shapValue == null) {
            return '실측 평균 기준'
          }
          return `SHAP 영향 ${formatSignedPercent(shapValue * 100)}`
        })(),
        icon: '🌡',
        tone: 'red',
      },
      {
        label: '운량',
        value: cloudImpact == null ? '--' : `${Math.min(100, Math.round(Math.abs(cloudImpact) * 100))}%`,
        note: cloudImpact == null
          ? 'XAI 데이터 기반'
          : cloudImpact > 0 ? '운량 증가 영향' : '운량 감소 영향',
        icon: '☁',
        tone: 'gray',
      },
      {
        label: '습도',
        value: humidity == null ? '--' : `${Math.round(humidity)}%`,
        note: (() => {
          const shapValue = getFeatureMean(xaiExplanations, ['humidity'])
          if (shapValue == null) {
            return '실측 평균 기준'
          }
          return `SHAP 영향 ${formatSignedPercent(shapValue * 100)}`
        })(),
        icon: '💧',
        tone: 'blue',
      },
    ]
  }, [bridgeMeasurements, xaiExplanations])
  const aiSummaryText = useMemo(
    () => buildAiSummaryText(xaiExplanations, shapFeatureContributions),
    [shapFeatureContributions, xaiExplanations],
  )
  const shapChartOption = useMemo<EChartsCoreOption>(() => {
    const maxContribution = Math.max(...shapFeatureContributions.map((feature) => Math.abs(feature.value)), 0.6)
    const chartMax = Number((Math.ceil(maxContribution * 10) / 10).toFixed(1))

    return ({
    grid: { top: 4, right: 58, bottom: 0, left: 58 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: unknown) => (typeof value === 'number' ? value.toFixed(2) : '-'),
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: chartMax,
      show: false,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: shapFeatureContributions.map((feature) => feature.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#5f5e5a',
        fontSize: 10,
        fontWeight: 600,
      },
    },
    series: [
      {
        name: 'SHAP 기여도',
        type: 'bar',
        barWidth: 14,
        barGap: '-100%',
        silent: true,
        tooltip: { show: false },
        data: shapFeatureContributions.map(() => ({
          value: chartMax,
          itemStyle: { color: '#eceae4', borderRadius: 3 },
        })),
      },
      {
        name: '기여도',
        type: 'bar',
        barWidth: 14,
        data: shapFeatureContributions.map((feature) => ({
          value: Math.abs(feature.value),
          rawValue: feature.value,
          itemStyle: { color: feature.color, borderRadius: 3 },
          label: {
            show: true,
            position: 'right',
            formatter: feature.value > 0 ? `+${feature.value.toFixed(2)}` : feature.value.toFixed(2),
            color: feature.color,
            fontSize: 9,
            fontWeight: 700,
          },
        })),
      },
    ],
  })
  }, [shapFeatureContributions])

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
              <p>{timelineError || forecastError || bridgeError || 'XGBoost 기반 · 실측 + 예측 · 대시보드와 동일 차트'}</p>
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
          <section className={[styles.panel, styles.shapPanel].join(' ')} aria-labelledby="shap-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="shap-title">SHAP 피처 기여도</h2>
                <p>내일 예측에 영향을 미친 요인 분석</p>
              </div>
            </div>
            <div className={styles.shapEChartWrap}>
              <EChart
                ariaLabel="SHAP 피처 기여도 차트"
                className={styles.shapEChart}
                option={shapChartOption}
              />
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
              <p>{aiSummaryText}</p>
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
