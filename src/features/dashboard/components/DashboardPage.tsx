import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EChartsCoreOption } from 'echarts/core'
import { getForecast, getMeasurements } from '@/api'
import type { ForecastPoint, MeasurementPoint } from '@/api'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { EChart } from '@/shared/ui/EChart'
import styles from './DashboardPage.module.css'

const PLANT_ID = 1

const generationRanges = [
  { id: '5m', label: '5m', durationMs: 5 * 60 * 1000 },
  { id: '1h', label: '1h', durationMs: 60 * 60 * 1000 },
  { id: '1d', label: '1d', durationMs: 24 * 60 * 60 * 1000 },
] as const

type GenerationRangeId = (typeof generationRanges)[number]['id']

const summaryCards = [
  {
    label: '현재 발전량',
    value: '92.4',
    unit: 'kW',
    note: '정상 운영 중',
    trend: '↑ +2.1%',
    tone: 'blue',
    icon: '⚡',
    actionTo: '',
  },
  {
    label: '금일 발전량',
    value: '538.2',
    unit: 'kWh',
    note: '목표 대비',
    trend: '↑ +8.3%',
    tone: 'green',
    icon: '☀',
    actionTo: '',
  },
  {
    label: '발전 효율',
    value: '87.1',
    unit: '%',
    note: '평균 대비',
    trend: '↑ +2.1%',
    tone: 'amber',
    icon: '📊',
    actionTo: '',
  },
  {
    label: '이상 감지',
    value: '1',
    unit: '건',
    note: 'HIGH · 즉시 확인',
    trend: '즉시 확인 →',
    tone: 'red',
    icon: '⚠',
    actionTo: '/anomaly-detection',
  },
] as const

const fallbackMeasurements: MeasurementPoint[] = [
  { measuredAt: '2026-04-30T09:00:00Z', powerKw: 0, temperature: 21, irradiance: 120, humidity: 54 },
  { measuredAt: '2026-04-30T09:15:00Z', powerKw: 12, temperature: 22, irradiance: 220, humidity: 53 },
  { measuredAt: '2026-04-30T09:30:00Z', powerKw: 32, temperature: 23, irradiance: 360, humidity: 51 },
  { measuredAt: '2026-04-30T09:45:00Z', powerKw: 54, temperature: 24, irradiance: 520, humidity: 48 },
  { measuredAt: '2026-04-30T10:00:00Z', powerKw: 70, temperature: 25, irradiance: 650, humidity: 45 },
  { measuredAt: '2026-04-30T10:30:00Z', powerKw: 82, temperature: 26, irradiance: 710, humidity: 43 },
  { measuredAt: '2026-04-30T11:00:00Z', powerKw: 87, temperature: 27, irradiance: 760, humidity: 41 },
  { measuredAt: '2026-04-30T11:30:00Z', powerKw: 82, temperature: 28, irradiance: 730, humidity: 42 },
  { measuredAt: '2026-04-30T12:00:00Z', powerKw: 77, temperature: 29, irradiance: 700, humidity: 44 },
  { measuredAt: '2026-04-30T12:30:00Z', powerKw: 73, temperature: 29, irradiance: 680, humidity: 45 },
  { measuredAt: '2026-04-30T13:00:00Z', powerKw: 80, temperature: 28, irradiance: 710, humidity: 46 },
  { measuredAt: '2026-04-30T13:30:00Z', powerKw: 88, temperature: 28, irradiance: 740, humidity: 46 },
  { measuredAt: '2026-04-30T14:00:00Z', powerKw: 92.4, temperature: 27, irradiance: 760, humidity: 47 },
]

const fallbackForecasts: ForecastPoint[] = [
  { target_time: '2026-05-01T00:00:00', predicted_power_kw: 82, confidence: 0.91, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-01T06:00:00', predicted_power_kw: 88, confidence: 0.9, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-01T12:00:00', predicted_power_kw: 75, confidence: 0.87, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-01T18:00:00', predicted_power_kw: 66, confidence: 0.85, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-02T00:00:00', predicted_power_kw: 73, confidence: 0.84, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-02T06:00:00', predicted_power_kw: 83, confidence: 0.82, model_version: 'XGBoost', model_notes: null },
  { target_time: '2026-05-02T12:00:00', predicted_power_kw: 81, confidence: 0.81, model_version: 'XGBoost', model_notes: null },
]

const featureContributions = [
  { label: '일사량', value: 0.52, tone: 'blue', color: '#185fa5' },
  { label: '기온', value: 0.28, tone: 'green', color: '#1d9e75' },
  { label: '운량', value: -0.15, tone: 'red', color: '#e24b4a' },
  { label: '패널 상태', value: 0.1, tone: 'amber', color: '#ba7517' },
] as const

const alerts = [
  {
    severity: 'HIGH',
    category: 'POWER',
    title: '예상 대비 발전량 28% 감소',
    detail: '일사량 정상 · 인버터 연결 확인 필요',
    time: '오늘 13:40',
    tone: 'red',
  },
  {
    severity: 'MEDIUM',
    category: 'VISION',
    title: '패널 표면 오염 의심',
    detail: 'YOLOv11s 감지 · 신뢰도 93% · 보성 3구역',
    time: '오늘 13:50',
    tone: 'amber',
  },
] as const

function formatChartTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function formatGenerationChartTime(value: string, rangeId: GenerationRangeId) {
  const date = new Date(value)

  if (rangeId === '1d') {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      hour12: false,
    }).format(date)
  }

  return formatChartTime(value)
}

function formatChartDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value))
}

function roundChartValue(value: number) {
  return Number(value.toFixed(1))
}

function getGenerationRangeDuration(rangeId: GenerationRangeId) {
  return generationRanges.find((range) => range.id === rangeId)?.durationMs ?? generationRanges[0].durationMs
}

function getFallbackMeasurementsForRange(rangeId: GenerationRangeId) {
  const pointCount = rangeId === '5m' ? 6 : rangeId === '1h' ? 12 : 24
  const durationMs = getGenerationRangeDuration(rangeId)
  const endTime = Date.now()
  const startTime = endTime - durationMs
  const intervalMs = durationMs / Math.max(pointCount - 1, 1)
  const sourcePoints = fallbackMeasurements.slice(-pointCount)

  return Array.from({ length: pointCount }, (_, index) => {
    const sourcePoint = sourcePoints[index % sourcePoints.length]

    return {
      ...sourcePoint,
      measuredAt: new Date(startTime + intervalMs * index).toISOString(),
    }
  })
}

export function DashboardPage() {
  const [selectedGenerationRange, setSelectedGenerationRange] = useState<GenerationRangeId>('5m')
  const [measurements, setMeasurements] = useState<MeasurementPoint[]>(() => getFallbackMeasurementsForRange('5m'))
  const [forecasts, setForecasts] = useState<ForecastPoint[]>(fallbackForecasts)
  const [isUsingFallbackMeasurements, setIsUsingFallbackMeasurements] = useState(true)
  const [isUsingFallbackForecast, setIsUsingFallbackForecast] = useState(true)
  const isUsingFallbackChartData = isUsingFallbackMeasurements || isUsingFallbackForecast

  useEffect(() => {
    let isActive = true
    const to = new Date()
    const from = new Date(to.getTime() - getGenerationRangeDuration(selectedGenerationRange))

    getMeasurements(PLANT_ID, from.toISOString(), to.toISOString())
      .then((measurementResponse) => {
        if (!isActive) {
          return
        }

        const hasBackendData = measurementResponse.data.series.length > 0
        const nextMeasurements = hasBackendData
          ? measurementResponse.data.series
          : getFallbackMeasurementsForRange(selectedGenerationRange)

        setMeasurements(nextMeasurements)
        setIsUsingFallbackMeasurements(!hasBackendData)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setMeasurements(getFallbackMeasurementsForRange(selectedGenerationRange))
        setIsUsingFallbackMeasurements(true)
      })

    return () => {
      isActive = false
    }
  }, [selectedGenerationRange])

  useEffect(() => {
    let isActive = true

    getForecast(PLANT_ID)
      .then((forecastResponse) => {
        if (!isActive) {
          return
        }

        const hasBackendData = forecastResponse.data.forecast_series.length > 0

        setForecasts(hasBackendData ? forecastResponse.data.forecast_series : fallbackForecasts)
        setIsUsingFallbackForecast(!hasBackendData)
      })
      .catch(() => {
        if (!isActive) {
          return
        }

        setForecasts(fallbackForecasts)
        setIsUsingFallbackForecast(true)
      })

    return () => {
      isActive = false
    }
  }, [])

  const generationChartOption = useMemo<EChartsCoreOption>(() => ({
    color: ['#185fa5'],
    grid: { top: 16, right: 16, bottom: 28, left: 36 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: unknown) => `${value} kW`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: measurements.map((point) => formatGenerationChartTime(point.measuredAt, selectedGenerationRange)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#c4c2bb', fontSize: 9 },
      splitLine: { show: true, lineStyle: { color: '#f5f3ef' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#c4c2bb', fontSize: 9 },
      splitLine: { lineStyle: { color: '#f5f3ef' } },
    },
    series: [
      {
        name: '발전량',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(24, 95, 165, 0.08)' },
        data: measurements.map((point) => roundChartValue(point.powerKw)),
      },
    ],
  }), [measurements, selectedGenerationRange])

  const forecastChartOption = useMemo<EChartsCoreOption>(() => {
    const actualMeasurements = measurements.slice(-5)
    const latestActualMeasurement = actualMeasurements[actualMeasurements.length - 1]
    const labels = [
      ...actualMeasurements.map((point) => formatChartDate(point.measuredAt)),
      ...forecasts.map((point) => formatChartDate(point.target_time)),
    ]
    const actualData = [
      ...actualMeasurements.map((point) => roundChartValue(point.powerKw)),
      ...forecasts.map(() => null),
    ]
    const forecastData = [
      ...actualMeasurements.slice(0, -1).map(() => null),
      latestActualMeasurement ? roundChartValue(latestActualMeasurement.powerKw) : null,
      ...forecasts.map((point) => roundChartValue(point.predicted_power_kw)),
    ]

    return {
      color: ['#1d9e75', '#185fa5'],
      grid: { top: 16, right: 16, bottom: 34, left: 28 },
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value} kW` : '-'),
      },
      legend: {
        bottom: 0,
        left: 0,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: '#5f5e5a', fontSize: 9 },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#c4c2bb', fontSize: 9 },
      },
      yAxis: {
        type: 'value',
        min: 40,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#c4c2bb', fontSize: 9 },
        splitLine: { lineStyle: { color: '#f5f3ef' } },
      },
      series: [
        {
          name: '실측값',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3 },
          data: actualData,
        },
        {
          name: '예측값 (XGBoost)',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3 },
          areaStyle: { color: 'rgba(24, 95, 165, 0.06)' },
          data: forecastData,
        },
      ],
    }
  }, [forecasts, measurements])

  const shapChartOption = useMemo<EChartsCoreOption>(() => ({
    grid: { top: 4, right: 58, bottom: 0, left: 58 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: unknown) => (typeof value === 'number' ? value.toFixed(2) : '-'),
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 0.6,
      show: false,
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: featureContributions.map((feature) => feature.label),
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
        data: featureContributions.map(() => ({
          value: 0.52,
          itemStyle: { color: '#eceae4', borderRadius: 3 },
        })),
      },
      {
        name: '기여도',
        type: 'bar',
        barWidth: 14,
        data: featureContributions.map((feature) => ({
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
  }), [])

  return (
    <div className={styles.dashboard}>
      <DashboardSidebar activeSection="dashboard" />

      <main className={styles.mainContent}>
        <header className={styles.headerBar}>
          <div className={styles.headerTitle}>
            <h1>전북 익산 1호 발전소</h1>
            <span className={styles.statusBadge}>
              <span aria-hidden="true" />
              정상 운영
            </span>
            <time>마지막 업데이트 · 14:32:05</time>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="알림">🔔<span /></button>
            <button className={styles.iconButton} type="button" aria-label="설정">⚙</button>
            <button className={styles.refreshButton} type="button" aria-label="새로고침">↻</button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.summaryGrid} aria-label="발전소 요약">
            {summaryCards.map((card) => (
              <article key={card.label} className={[styles.summaryCard, styles[card.tone]].join(' ')}>
                <span className={styles.cardIcon}>{card.icon}</span>
                <p>{card.label}</p>
                <strong>
                  {card.value}
                  <small>{card.unit}</small>
                </strong>
                <div>
                  <span>{card.note}</span>
                  {card.actionTo ? (
                    <Link to={card.actionTo}>{card.trend}</Link>
                  ) : (
                    <b>{card.trend}</b>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className={styles.panel} aria-labelledby="generation-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleRow}>
                  <h2 id="generation-title">실시간 발전량</h2>
                  <span className={styles.liveBadge}><span />Live</span>
                </div>
                <p>kW · 백엔드 계측 데이터{isUsingFallbackChartData ? ' · 샘플 표시 중' : ''}</p>
              </div>
              <div className={styles.segmentedControl} aria-label="차트 범위">
                {generationRanges.map((range) => (
                  <button
                    key={range.id}
                    className={selectedGenerationRange === range.id ? styles.segmentActive : ''}
                    type="button"
                    aria-pressed={selectedGenerationRange === range.id}
                    onClick={() => setSelectedGenerationRange(range.id)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <EChart
              ariaLabel="백엔드 계측 데이터 기반 실시간 발전량 차트"
              className={styles.mainEChart}
              option={generationChartOption}
            />
          </section>

          <section className={styles.panel} aria-labelledby="forecast-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleRow}>
                  <h2 id="forecast-title">AI 발전량 예측 (2~3일)</h2>
                  <span className={styles.aiBadge}>AI Powered</span>
                </div>
                <p>XGBoost 기반 · 백엔드 예측 API 연동{isUsingFallbackChartData ? ' · 샘플 표시 중' : ''}</p>
              </div>
            </div>

            <div className={styles.forecastBody}>
              <div className={styles.forecastChart}>
                <EChart
                  ariaLabel="백엔드 예측 데이터 기반 AI 발전량 예측 차트"
                  className={styles.forecastEChart}
                  option={forecastChartOption}
                />
              </div>

              <aside className={styles.shapCard} aria-label="SHAP 피처 기여도">
                <h3>SHAP 피처 기여도</h3>
                <p>각 피처가 예측에 미친 영향</p>
                <EChart
                  ariaLabel="SHAP 피처 기여도 차트"
                  className={styles.shapEChart}
                  option={shapChartOption}
                />
              </aside>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="alerts-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleRow}>
                  <h2 id="alerts-title">패널 이상 감지</h2>
                  <span className={styles.alertBadge}>YOLOv11s</span>
                  <span className={styles.aiBadge}>Grad-CAM</span>
                </div>
                <p>YOLOv11s + SAHI · Grad-CAM 기반 실시간 분석</p>
              </div>
              <Link className={styles.listButton} to="/anomaly-detection">전체 목록 →</Link>
            </div>

            <div className={styles.alertList}>
              {alerts.map((alert) => (
                <article key={alert.title} className={[styles.alertItem, styles[alert.tone]].join(' ')}>
                  <div className={styles.alertTags}>
                    <span>{alert.severity}</span>
                    <small>{alert.category}</small>
                  </div>
                  <div className={styles.alertCopy}>
                    <h3>{alert.title}</h3>
                    <p>{alert.detail}</p>
                    <time>{alert.time}</time>
                  </div>
                  <div className={styles.alertAction}>
                    <Link to="/anomaly-detection/detail">확인하기</Link>
                    <small>✉ 메일 발송됨</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
