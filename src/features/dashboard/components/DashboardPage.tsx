import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EChartsCoreOption } from 'echarts/core'
import { getAnomalies, getDashboardSummary, getForecast, getMeasurements, getPlants } from '@/api'
import type { AnomalyEvent, DashboardSummary, ForecastPoint, MeasurementPoint, Plant } from '@/api'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { DashboardSettingsMenu } from '@/shared/layout/DashboardSettingsMenu'
import {
  FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS,
  buildForecastComboChartOption,
  createDummyBridgeMeasurements,
  createDummyForecastSeries,
} from '@/shared/charts/forecastComboChartOption'
import { EChart } from '@/shared/ui/EChart'
import { formatKoreanDateTime, formatLocalDateTimeForApi, formatRelativeTime } from '@/shared/utils/dateFormat'
import styles from './DashboardPage.module.css'

const generationRanges = [
  { id: '1h', label: '1h', durationMs: 60 * 60 * 1000 },
  { id: '12h', label: '12h', durationMs: 12 * 60 * 60 * 1000 },
  { id: '1d', label: '1d', durationMs: 24 * 60 * 60 * 1000 },
] as const

type GenerationRangeId = (typeof generationRanges)[number]['id']

const featureContributions = [
  { label: '일사량', value: 0.52, tone: 'blue', color: '#185fa5' },
  { label: '기온', value: 0.28, tone: 'green', color: '#1d9e75' },
  { label: '운량', value: -0.15, tone: 'red', color: '#e24b4a' },
  { label: '패널 상태', value: 0.1, tone: 'amber', color: '#ba7517' },
] as const

function parseBackendDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function formatChartTime(value: string | number) {
  const date = typeof value === 'number' ? new Date(value) : new Date(parseBackendDateTime(value))
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

function formatGenerationChartTime(value: string | number, rangeId: GenerationRangeId) {
  const date = typeof value === 'number' ? new Date(value) : new Date(parseBackendDateTime(value))

  if (rangeId === '1d') {
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${month}/${day} ${formatChartTime(date.getTime())}`
  }

  return formatChartTime(date.getTime())
}

function roundChartValue(value: number) {
  return Number(value.toFixed(1))
}

function getGenerationRangeDuration(rangeId: GenerationRangeId) {
  return generationRanges.find((range) => range.id === rangeId)?.durationMs ?? generationRanges[0].durationMs
}

function getGenerationAxisInterval(rangeId: GenerationRangeId) {
  return rangeId === '1h' ? 15 * 60 * 1000 : 60 * 60 * 1000
}

function createDummyMeasurements(rangeId: GenerationRangeId): MeasurementPoint[] {
  const intervalMs = getGenerationAxisInterval(rangeId)
  const durationMs = getGenerationRangeDuration(rangeId)
  const axisMax = Math.ceil(Date.now() / intervalMs) * intervalMs
  const axisMin = axisMax - durationMs
  const pointCount = Math.floor(durationMs / intervalMs) + 1

  return Array.from({ length: pointCount }, (_, index) => {
    const ratio = pointCount === 1 ? 1 : index / (pointCount - 1)
    const curve = Math.sin(ratio * Math.PI)
    const powerKw = 1800 + curve * 7200 + Math.sin(index * 1.7) * 280

    return {
      measuredAt: new Date(axisMin + intervalMs * index).toISOString(),
      powerKw: Math.max(0, powerKw),
      temperature: 22 + curve * 8,
      irradiance: 180 + curve * 720,
      humidity: 62 - curve * 18,
    }
  })
}

function getPowerAxisMax(values: number[]) {
  const maxValue = Math.max(...values, 0)

  if (maxValue <= 0) {
    return 100
  }

  return Math.ceil((maxValue * 1.15) / 100) * 100
}

function getAnomalyTone(severity: string) {
  if (severity === 'HIGH') {
    return 'red'
  }

  if (severity === 'MEDIUM') {
    return 'amber'
  }

  return 'blue'
}

function getNotificationTone(severity: string) {
  if (severity === 'HIGH') {
    return 'notificationHigh'
  }

  if (severity === 'MEDIUM') {
    return 'notificationMedium'
  }

  return 'notificationLow'
}

function getAnomalyDetailPath(eventId: number) {
  return `/anomaly-detection/detail?eventId=${eventId}`
}

function formatMetric(value: number | undefined, digits = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--'
  }

  return value.toLocaleString('ko-KR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function DashboardPage() {
  const [selectedGenerationRange, setSelectedGenerationRange] = useState<GenerationRangeId>('1h')
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null)
  const [summaryError, setSummaryError] = useState('')
  const [measurements, setMeasurements] = useState<MeasurementPoint[]>([])
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [measurementError, setMeasurementError] = useState('')
  const [forecastError, setForecastError] = useState('')
  const [forecastBridgeMeasurements, setForecastBridgeMeasurements] = useState<MeasurementPoint[]>([])
  const [forecastBridgeError, setForecastBridgeError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const selectedPlant = plants.find((plant) => plant.plantId === selectedPlantId)
  const activeAnomalies = anomalies.filter((anomaly) => anomaly.status !== 'RESOLVED')
  const hasNotifications = activeAnomalies.length > 0
  const isSummaryMissingData = !dashboardSummary
  const summaryStatusText = summaryError || (isSummaryMissingData ? 'API 데이터 없음' : '실시간 API 반영')
  const summaryCards = [
    {
      label: '현재 발전량',
      value: formatMetric(dashboardSummary?.currentPowerKw),
      unit: 'kW',
      note: '현재 실시간 발전량',
      trend: summaryStatusText,
      tone: 'blue',
      icon: '⚡',
      actionTo: '',
    },
    {
      label: '금일 발전량',
      value: formatMetric(dashboardSummary?.todayGenerationKwh),
      unit: 'kWh',
      note: '오늘 누적 발전량',
      trend: summaryStatusText,
      tone: 'green',
      icon: '☀',
      actionTo: '',
    },
    {
      label: '발전 효율',
      value: formatMetric(dashboardSummary?.efficiencyPercent),
      unit: '%',
      note: '최대치 대비 효율',
      trend: summaryStatusText,
      tone: 'amber',
      icon: '📊',
      actionTo: '',
    },
    {
      label: '이상 감지',
      value: String(activeAnomalies.length),
      unit: '건',
      note: activeAnomalies[0] ? `${activeAnomalies[0].severity} · 즉시 확인` : '이상 이벤트 없음',
      trend: activeAnomalies.length > 0 ? '즉시 확인 →' : '정상',
      tone: activeAnomalies.length > 0 ? 'red' : 'blue',
      icon: '⚠',
      actionTo: activeAnomalies.length > 0 ? '/anomaly-detection' : '',
    },
  ] as const

  useEffect(() => {
    let isActive = true

    getPlants()
      .then((plantResponse) => {
        if (!isActive) {
          return
        }

        setPlants(plantResponse.data)
        setSelectedPlantId(plantResponse.data[0]?.plantId ?? null)

        if (plantResponse.data.length === 0) {
          setNotificationError('현재 계정에 연결된 발전소가 없습니다.')
        }
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        console.error('발전소 목록 조회 실패:', error)
        setPlants([])
        setSelectedPlantId(null)
        setNotificationError(error instanceof Error ? error.message : '발전소 목록을 불러오지 못했습니다.')
      })

    return () => {
      isActive = false
    }
  }, [refreshKey])

  useEffect(() => {
    if (!selectedPlantId) {
      setMeasurements([])
      setMeasurementError('발전소 데이터 없음')
      return
    }

    let isActive = true

    const fetchMeasurements = () => {
      const to = new Date()
      const from = new Date(to.getTime() - getGenerationRangeDuration(selectedGenerationRange))

      getMeasurements(selectedPlantId, formatLocalDateTimeForApi(from), formatLocalDateTimeForApi(to))
        .then((measurementResponse) => {
          if (!isActive) {
            return
          }

          const hasBackendData = measurementResponse.data.series.length > 0
          setMeasurements(hasBackendData ? measurementResponse.data.series : createDummyMeasurements(selectedGenerationRange))
          setMeasurementError(hasBackendData ? '' : '계측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('실시간 발전량 조회 실패:', error)
          setMeasurements(createDummyMeasurements(selectedGenerationRange))
          setMeasurementError(`${error instanceof Error ? error.message : '계측 API 조회 실패'} · 더미 데이터 표시 중`)
        })
    }

    fetchMeasurements()
    const pollingTimer = window.setInterval(fetchMeasurements, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [refreshKey, selectedGenerationRange, selectedPlantId])

  useEffect(() => {
    if (!selectedPlantId) {
      setDashboardSummary(null)
      setSummaryError('발전소 데이터 없음')
      return
    }

    let isActive = true

    const fetchDashboardSummary = () => {
      getDashboardSummary(selectedPlantId)
        .then((summaryResponse) => {
          if (!isActive) {
            return
          }

          setDashboardSummary(summaryResponse.data)
          setSummaryError('')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('대시보드 요약 조회 실패:', error)
          setDashboardSummary(null)
          setSummaryError(error instanceof Error ? error.message : '요약 API 조회 실패')
        })
    }

    fetchDashboardSummary()
    const pollingTimer = window.setInterval(fetchDashboardSummary, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [refreshKey, selectedPlantId])

  useEffect(() => {
    if (!selectedPlantId) {
      setForecasts([])
      setForecastError('발전소 데이터 없음')
      return
    }

    let isActive = true

    const fetchForecasts = () => {
      getForecast(selectedPlantId)
        .then((forecastResponse) => {
          if (!isActive) {
            return
          }

          const hasBackendData = forecastResponse.data.forecast_series.length > 0
          setForecasts(hasBackendData ? forecastResponse.data.forecast_series : createDummyForecastSeries())
          setForecastError(hasBackendData ? '' : '예측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('AI 발전량 예측 조회 실패:', error)
          setForecasts(createDummyForecastSeries())
          setForecastError(`${error instanceof Error ? error.message : '예측 API 조회 실패'} · 더미 데이터 표시 중`)
        })
    }

    fetchForecasts()
    const pollingTimer = window.setInterval(fetchForecasts, 30000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [refreshKey, selectedPlantId])

  useEffect(() => {
    if (!selectedPlantId) {
      setForecastBridgeMeasurements([])
      setForecastBridgeError('발전소 데이터 없음')
      return
    }

    let isActive = true

    const fetchForecastBridge = () => {
      const to = new Date()
      const from = new Date(to.getTime() - FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS)

      getMeasurements(selectedPlantId, formatLocalDateTimeForApi(from), formatLocalDateTimeForApi(to))
        .then((measurementResponse) => {
          if (!isActive) {
            return
          }

          const hasBackendData = measurementResponse.data.series.length > 0
          setForecastBridgeMeasurements(hasBackendData ? measurementResponse.data.series : createDummyBridgeMeasurements())
          setForecastBridgeError(hasBackendData ? '' : '계측 API 데이터 없음 · 더미 데이터 표시 중')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('예측 차트용 계측 조회 실패:', error)
          setForecastBridgeMeasurements(createDummyBridgeMeasurements())
          setForecastBridgeError(`${error instanceof Error ? error.message : '계측 API 조회 실패'} · 더미 데이터 표시 중`)
        })
    }

    fetchForecastBridge()
    const bridgeTimer = window.setInterval(fetchForecastBridge, 5000)

    return () => {
      isActive = false
      window.clearInterval(bridgeTimer)
    }
  }, [refreshKey, selectedPlantId])

  useEffect(() => {
    if (!selectedPlantId) {
      setAnomalies([])
      return
    }

    let isActive = true

    const fetchAnomalies = () => {
      getAnomalies(selectedPlantId, 10)
        .then((anomalyResponse) => {
          if (!isActive) {
            return
          }

          setAnomalies(anomalyResponse.data)
          setNotificationError('')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('이상감지 알림 조회 실패:', error)
          setAnomalies([])
          setNotificationError(error instanceof Error ? error.message : '이상감지 알림을 불러오지 못했습니다.')
        })
    }

    fetchAnomalies()
    const pollingTimer = window.setInterval(fetchAnomalies, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [refreshKey, selectedPlantId])

  const generationChartOption = useMemo<EChartsCoreOption>(() => {
    const powerValues = measurements.map((point) => point.powerKw)
    const axisInterval = getGenerationAxisInterval(selectedGenerationRange)
    const axisMax = Math.ceil(Date.now() / axisInterval) * axisInterval
    const axisMin = axisMax - getGenerationRangeDuration(selectedGenerationRange)

    return {
      color: ['#185fa5'],
      grid: { top: 16, right: 16, bottom: 28, left: 48 },
      graphic: measurements.length === 0
        ? {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: measurementError || '계측 API 데이터 없음',
              fill: '#888780',
              fontSize: 13,
              fontWeight: 600,
            },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value} kW` : '-'),
      },
      xAxis: {
        type: 'time',
        min: axisMin,
        max: axisMax,
        interval: axisInterval,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#c4c2bb',
          fontSize: 9,
          hideOverlap: true,
          formatter: (value: number) => formatGenerationChartTime(value, selectedGenerationRange),
        },
        splitLine: { show: true, lineStyle: { color: '#f5f3ef' } },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: getPowerAxisMax(powerValues),
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
          data: measurements.map((point) => [parseBackendDateTime(point.measuredAt), roundChartValue(point.powerKw)]),
        },
      ],
    }
  }, [measurementError, measurements, selectedGenerationRange])

  const forecastChartOption = useMemo<EChartsCoreOption>(
    () =>
      buildForecastComboChartOption({
        bridgeMeasurements: forecastBridgeMeasurements,
        forecasts,
        bridgeError: forecastBridgeError,
        forecastError,
      }),
    [forecastBridgeError, forecastBridgeMeasurements, forecastError, forecasts],
  )

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
            <h1>{selectedPlant?.name ?? '발전소 대시보드'}</h1>
            <span className={styles.statusBadge}>
              <span aria-hidden="true" />
              정상 운영
            </span>
            <time>마지막 업데이트 · 14:32:05</time>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.notificationWrap}>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="알림"
                aria-expanded={isNotificationOpen}
                aria-haspopup="menu"
                onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
              >
                🔔
                {hasNotifications ? <span className={styles.notificationDot} aria-hidden="true" /> : null}
              </button>

              {isNotificationOpen ? (
                <div className={styles.notificationDropdown} role="menu" aria-label="이상 감지 알림">
                  <header>
                    <div className={styles.notificationTitle}>
                      <strong>알림</strong>
                      {hasNotifications ? <span>{activeAnomalies.length}</span> : null}
                    </div>
                    <button type="button">모두 읽음</button>
                  </header>

                  {notificationError ? (
                    <p className={styles.notificationEmpty}>{notificationError}</p>
                  ) : hasNotifications ? (
                    <div className={styles.notificationList}>
                      {activeAnomalies.map((anomaly) => (
                        <Link
                          key={anomaly.eventId}
                          className={[styles.notificationItem, styles[getNotificationTone(anomaly.severity)]].join(' ')}
                          to={getAnomalyDetailPath(anomaly.eventId)}
                          role="menuitem"
                        >
                          <span className={styles.notificationDotItem} aria-hidden="true" />
                          <div className={styles.notificationContent}>
                            <div className={styles.notificationTags}>
                              <span className={styles.notificationSeverity}>{anomaly.severity}</span>
                              <span className={styles.notificationType}>{anomaly.type}</span>
                            </div>
                            <strong>{anomaly.summary}</strong>
                          </div>
                          <time>{formatRelativeTime(anomaly.detectedAt)}</time>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.notificationEmpty}>현재 확인할 이상 감지 알림이 없습니다.</p>
                  )}

                  <Link className={styles.notificationFooterLink} to="/settings/notifications" role="menuitem">
                    알림 설정 전체 보기 →
                  </Link>
                </div>
              ) : null}
            </div>
            <DashboardSettingsMenu />
            <button
              className={styles.refreshButton}
              type="button"
              aria-label="새로고침"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              ↻
            </button>
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
                <p>{measurementError || 'kW · 백엔드 계측 데이터 실시간 반영'}</p>
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
                <p>{forecastError || 'XGBoost 기반 · 백엔드 예측 API 연동'}</p>
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
              {activeAnomalies.length > 0 ? (
                activeAnomalies.map((anomaly) => (
                  <article key={anomaly.eventId} className={[styles.alertItem, styles[getAnomalyTone(anomaly.severity)]].join(' ')}>
                    <div className={styles.alertTags}>
                      <span>{anomaly.severity}</span>
                      <small>{anomaly.type}</small>
                    </div>
                    <div className={styles.alertCopy}>
                      <h3>{anomaly.summary}</h3>
                      <p>{anomaly.cause || anomaly.recommendedAction || anomaly.xaiExplanation || '이상 이벤트 상세 확인이 필요합니다.'}</p>
                      <time>{formatKoreanDateTime(anomaly.detectedAt)}</time>
                    </div>
                    <div className={styles.alertAction}>
                      <Link to={getAnomalyDetailPath(anomaly.eventId)}>확인하기</Link>
                      <small>{anomaly.status}</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyAlert}>현재 감지된 이상 이벤트가 없습니다.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
