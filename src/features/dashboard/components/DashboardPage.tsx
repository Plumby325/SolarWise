import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EChartsCoreOption } from 'echarts/core'
import {
  getAnomalies,
  getForecast,
  getForecastExplanation,
  getPlants,
} from '@/api'
import type {
  AnomalyEvent,
  Plant,
  TimelineAnomalyMarker,
  XaiExplanationPoint,
} from '@/api'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { DashboardSettingsMenu } from '@/shared/layout/DashboardSettingsMenu'
import {
  buildDashboardTimelineChartOption,
  extractMarkerFromChartClick,
  type TimelineChartClickParams,
} from '@/shared/charts/dashboardTimelineChartOption'
import {
  buildTimelineForecastChartOption,
} from '@/shared/charts/forecastComboChartOption'
import { deriveShapFeatureContributions } from '@/shared/charts/xaiFeatureContributions'
import { useDashboardTimeline } from '@/shared/hooks/useDashboardTimeline'
import { EChart } from '@/shared/ui/EChart'
import { formatKoreanDateTime, formatRelativeTime } from '@/shared/utils/dateFormat'
import { TimelineAnomalyPanel } from './TimelineAnomalyPanel'
import styles from './DashboardPage.module.css'

const timelineRanges = [
  { id: 'DAY', label: 'DAY' },
  { id: 'WEEK', label: 'WEEK' },
  { id: 'MONTH', label: 'MONTH' },
] as const

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

function parseTimelineDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function isSameLocalDay(leftMs: number, rightMs: number) {
  const left = new Date(leftMs)
  const right = new Date(rightMs)
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  )
}

export function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [selectedMarker, setSelectedMarker] = useState<TimelineAnomalyMarker | null>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [forecastError, setForecastError] = useState('')
  const [xaiExplanations, setXaiExplanations] = useState<XaiExplanationPoint[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const seenHighAnomalyIdsRef = useRef<Set<number>>(new Set())
  const {
    range,
    setRange,
    timeline,
    playback,
    error: timelineError,
    virtualNow,
    refresh: refreshTimeline,
  } = useDashboardTimeline(selectedPlantId, refreshKey)

  const selectedPlant = plants.find((plant) => plant.plantId === selectedPlantId)
  const activeAnomalies = anomalies.filter((anomaly) => anomaly.status !== 'RESOLVED')
  const hasNotifications = activeAnomalies.length > 0
  const summaryStatusText = timelineError || (timeline ? '시뮬레이션 타임라인 반영' : '타임라인 데이터 없음')

  const timelineSummary = useMemo(() => {
    if (!timeline) {
      return {
        currentPowerKw: undefined,
        todayGenerationKwh: undefined,
        efficiencyPercent: undefined,
      }
    }

    const virtualNowMs = parseTimelineDateTime(timeline.virtualNow)
    const actualWithMs = timeline.actualSeries
      .map((point) => ({ ...point, measuredAtMs: parseTimelineDateTime(point.measuredAt) }))
      .filter((point) => Number.isFinite(point.measuredAtMs))
      .sort((a, b) => a.measuredAtMs - b.measuredAtMs)
    const predictionWithMs = timeline.predictionSeries
      .map((point) => ({ ...point, measuredAtMs: parseTimelineDateTime(point.measuredAt) }))
      .filter((point) => Number.isFinite(point.measuredAtMs))
      .sort((a, b) => a.measuredAtMs - b.measuredAtMs)

    const latestActualPoint = [...actualWithMs]
      .reverse()
      .find((point) => point.measuredAtMs <= virtualNowMs) ?? actualWithMs[actualWithMs.length - 1]

    const nearestPredictionPoint = predictionWithMs.reduce<typeof predictionWithMs[number] | null>((nearest, point) => {
      if (!nearest) {
        return point
      }
      const currentDiff = Math.abs(point.measuredAtMs - virtualNowMs)
      const nearestDiff = Math.abs(nearest.measuredAtMs - virtualNowMs)
      return currentDiff < nearestDiff ? point : nearest
    }, null)

    const todayPoints = actualWithMs.filter((point) => isSameLocalDay(point.measuredAtMs, virtualNowMs))
    const inferredIntervalHours = todayPoints.length > 1
      ? Math.max(
          0.25,
          (todayPoints[todayPoints.length - 1].measuredAtMs - todayPoints[0].measuredAtMs)
            / ((todayPoints.length - 1) * 60 * 60 * 1000),
        )
      : 1
    const todayGenerationKwh = todayPoints.length > 0
      ? Number((todayPoints.reduce((sum, point) => sum + point.powerKw, 0) * inferredIntervalHours).toFixed(1))
      : undefined

    const efficiencyPercent = latestActualPoint && nearestPredictionPoint && nearestPredictionPoint.powerKw > 0
      ? Number(Math.min(100, (latestActualPoint.powerKw / nearestPredictionPoint.powerKw) * 100).toFixed(1))
      : undefined

    return {
      currentPowerKw: latestActualPoint?.powerKw,
      todayGenerationKwh,
      efficiencyPercent,
    }
  }, [timeline])

  const summaryCards = [
    {
      label: '현재 발전량',
      value: formatMetric(timelineSummary.currentPowerKw),
      unit: 'kW',
      note: '현재 실시간 발전량',
      trend: summaryStatusText,
      tone: 'blue',
      icon: '⚡',
      actionTo: '',
    },
    {
      label: '금일 발전량',
      value: formatMetric(timelineSummary.todayGenerationKwh),
      unit: 'kWh',
      note: '오늘 누적 발전량',
      trend: summaryStatusText,
      tone: 'green',
      icon: '☀',
      actionTo: '',
    },
    {
      label: '발전 효율',
      value: formatMetric(timelineSummary.efficiencyPercent),
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
    const highMarkers = (timeline?.anomalyMarkers ?? []).filter((marker) => marker.severity === 'HIGH')
    if (highMarkers.length === 0) {
      return
    }

    const nextNew = highMarkers.filter((marker) => !seenHighAnomalyIdsRef.current.has(marker.eventId))
    nextNew.forEach((marker) => seenHighAnomalyIdsRef.current.add(marker.eventId))
    if (nextNew.length === 0) {
      return
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      nextNew.forEach((marker) => {
        const title = marker.type ? `[${marker.type}] ${marker.severity}` : marker.severity
        const body = marker.summary || '새 이상 이벤트가 감지되었습니다.'
        void new Notification(title, { body })
      })
    }
  }, [timeline?.anomalyMarkers])

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

  useEffect(() => {
    if (!selectedPlantId) {
      setXaiExplanations([])
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
          setXaiExplanations(Array.isArray(forecastResponse.data.explanations) ? forecastResponse.data.explanations : [])
          setForecastError(hasBackendData ? '' : '예측 API 데이터 없음')
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          console.error('AI 발전량 예측 조회 실패:', error)
          setXaiExplanations([])
          setForecastError(error instanceof Error ? error.message : '예측 API 조회 실패')
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
      setXaiExplanations([])
      return
    }

    let isActive = true

    const fetchForecastExplanations = () => {
      getForecastExplanation(selectedPlantId)
        .then((explanationResponse) => {
          if (!isActive) {
            return
          }
          setXaiExplanations(explanationResponse.data.explanations)
        })
        .catch((error) => {
          if (!isActive) {
            return
          }
          console.error('SHAP 설명 조회 실패:', error)
        })
    }

    fetchForecastExplanations()
    const pollingTimer = window.setInterval(fetchForecastExplanations, 30000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [refreshKey, selectedPlantId])

  const timelineChartOption = useMemo<EChartsCoreOption>(
    () => buildDashboardTimelineChartOption(timeline, timelineError),
    [timeline, timelineError],
  )

  const timelineChartEvents = useMemo(
    () => ({
      click: (params: unknown) => {
        const marker = extractMarkerFromChartClick(params as TimelineChartClickParams)
        if (marker) {
          setSelectedMarker(marker)
        }
      },
    }),
    [],
  )

  const forecastChartOption = useMemo<EChartsCoreOption>(
    () => buildTimelineForecastChartOption(timeline, timelineError || forecastError),
    [forecastError, timeline, timelineError],
  )

  const shapFeatureContributions = useMemo(
    () => deriveShapFeatureContributions(xaiExplanations),
    [xaiExplanations],
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
            <span className={styles.playbackBadge}>
              {playback?.tickSeconds ?? 1}s fixed
            </span>
            <time>가상 현재 시각 · {virtualNow ? formatKoreanDateTime(virtualNow) : '—'}</time>
            <time>마지막 업데이트 · {timeline ? formatKoreanDateTime(timeline.lastUpdatedAt) : '—'}</time>
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

          <section className={styles.panel} aria-labelledby="timeline-title">
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.titleRow}>
                  <h2 id="timeline-title">대시보드 타임라인</h2>
                  <span className={styles.liveBadge}><span />Live</span>
                </div>
                <p>{timelineError || '실측 + 예측 + 이상 마커 · 시뮬레이션 연동'}</p>
              </div>
              <div className={styles.segmentedControl} aria-label="차트 범위">
                {timelineRanges.map((rangeOption) => (
                  <button
                    key={rangeOption.id}
                    className={range === rangeOption.id ? styles.segmentActive : ''}
                    type="button"
                    aria-pressed={range === rangeOption.id}
                    onClick={() => setRange(rangeOption.id)}
                  >
                    {rangeOption.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={[styles.timelineBody, !selectedMarker ? styles.timelineBodySingle : ''].filter(Boolean).join(' ')}>
              <div className={styles.timelineChart}>
                <EChart
                  ariaLabel="대시보드 타임라인 차트"
                  className={styles.mainEChart}
                  option={timelineChartOption}
                  onEvents={timelineChartEvents}
                />
              </div>
              {selectedMarker && selectedPlantId ? (
                <TimelineAnomalyPanel
                  plantId={selectedPlantId}
                  marker={selectedMarker}
                  onClose={() => setSelectedMarker(null)}
                  onStatusUpdated={() => {
                    void refreshTimeline()
                    setRefreshKey((key) => key + 1)
                  }}
                />
              ) : null}
            </div>
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
