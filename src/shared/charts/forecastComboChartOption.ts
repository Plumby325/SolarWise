import type { EChartsCoreOption } from 'echarts/core'
import type { DashboardTimelineResponse, ForecastPoint, MeasurementPoint } from '@/api'

/** 예측 차트 실측 브릿지용: 항상 이 구간만 조회 (실시간 차트 1h/12h/1d와 무관) */
export const FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS = 24 * 60 * 60 * 1000

export const FORECAST_BRIDGE_TAIL_COUNT = 5
export const FORECAST_ERROR_BAND_KW = 500

export type ForecastHorizonId = 'today' | '2d' | '3d'

function parseBackendDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function formatChartDateLabel(value: string) {
  const date = new Date(parseBackendDateTime(value))
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}.${day}`
}

function roundChartValue(value: number) {
  return Number(value.toFixed(1))
}

function createBackcastFromActual(actualPowerKw: number, index: number, total: number) {
  const ratio = total <= 1 ? 1 : index / (total - 1)
  const bias = 1.06 - ratio * 0.04
  return roundChartValue(actualPowerKw * bias)
}

function getPowerAxisMax(values: number[]) {
  const maxValue = Math.max(...values, 0)

  if (maxValue <= 0) {
    return 100
  }

  return Math.ceil((maxValue * 1.15) / 100) * 100
}

/** 발전량 예측 페이지: 예측 기간(오늘~3일)에 맞춰 시계열 필터 */
export function filterForecastsByHorizon(forecasts: ForecastPoint[], horizon: ForecastHorizonId): ForecastPoint[] {
  if (forecasts.length === 0) {
    return forecasts
  }

  const now = Date.now()
  const maxMs = horizon === 'today' ? 24 * 3600000 : horizon === '2d' ? 48 * 3600000 : 72 * 3600000

  const filtered = forecasts.filter((point) => {
    const t = parseBackendDateTime(point.target_time)

    return t >= now - 3600000 && t <= now + maxMs
  })

  return filtered.length > 0 ? filtered : forecasts
}

/** `.env`에 `VITE_USE_FORECAST_CHART_DUMMY=true`면 API 대신 2선 테스트 더미를 강제 사용 */
export function isForecastChartDummyForced(): boolean {
  return import.meta.env.VITE_USE_FORECAST_CHART_DUMMY === 'true'
}

export const FORECAST_CHART_DUMMY_MESSAGE = '2선 테스트 더미 데이터 표시 중'

/** 실측(최근 5시간) + 예측(앞 3일, 6시간 간격) — 차트 2선 검증용 고정 값 */
const DUMMY_ACTUAL_POWER_KW = [2900, 3600, 4300, 4700, 4400] as const
const DUMMY_FORECAST_POWER_KW = [4200, 5100, 5600, 4900, 5300, 5800, 5200, 4700, 5000, 5500, 5100, 4600] as const

export function createDummyForecastComboData(): {
  bridgeMeasurements: MeasurementPoint[]
  forecasts: ForecastPoint[]
} {
  const hourMs = 60 * 60 * 1000
  const forecastIntervalMs = 6 * hourMs
  const nowAligned = Math.floor(Date.now() / hourMs) * hourMs

  const bridgeMeasurements = DUMMY_ACTUAL_POWER_KW.map((powerKw, index) => {
    const hoursAgo = DUMMY_ACTUAL_POWER_KW.length - 1 - index

    return {
      measuredAt: new Date(nowAligned - hoursAgo * hourMs).toISOString(),
      powerKw,
      temperature: 22 + index * 0.8,
      irradiance: 500 + index * 60,
      humidity: 48 - index,
    }
  })

  const forecasts = DUMMY_FORECAST_POWER_KW.map((predicted_power_kw, index) => ({
    target_time: new Date(nowAligned + hourMs + index * forecastIntervalMs).toISOString(),
    predicted_power_kw,
    confidence: Math.max(0.83, 0.94 - index * 0.01),
    model_version: 'TEST-v1',
    model_notes: 'LINE_TEST_2SERIES',
  }))

  return { bridgeMeasurements, forecasts }
}

export function createDummyBridgeMeasurements(): MeasurementPoint[] {
  return createDummyForecastComboData().bridgeMeasurements
}

export function createDummyForecastSeries(): ForecastPoint[] {
  return createDummyForecastComboData().forecasts
}

/**
 * 대시보드·발전량 예측 공통: 실측/예측 2개 선 ECharts 옵션
 * `bridgeMeasurements`는 실시간 차트 범위와 별도로 가져온 고정 구간 계측만 사용할 것.
 */
export function buildForecastComboChartOption(params: {
  bridgeMeasurements: MeasurementPoint[]
  forecasts: ForecastPoint[]
  bridgeError: string
  forecastError: string
}): EChartsCoreOption {
  const { bridgeMeasurements, forecasts, bridgeError, forecastError } = params
  const actualMeasurements = bridgeMeasurements.slice(-FORECAST_BRIDGE_TAIL_COUNT)
  const hasForecastChartData = actualMeasurements.length > 0 || forecasts.length > 0
  const labels = [
    ...actualMeasurements.map((point) => formatChartDateLabel(point.measuredAt)),
    ...forecasts.map((point) => formatChartDateLabel(point.target_time)),
  ]
  const historicalForecastData = actualMeasurements.map((point, index) =>
    createBackcastFromActual(point.powerKw, index, actualMeasurements.length),
  )
  const actualData = [
    ...actualMeasurements.map((point) => roundChartValue(point.powerKw)),
    ...forecasts.map(() => null),
  ]
  const forecastData = [...historicalForecastData, ...forecasts.map((point) => roundChartValue(point.predicted_power_kw))]
  const forecastLowerBand = forecastData.map((value) => roundChartValue(Math.max(0, value - FORECAST_ERROR_BAND_KW)))
  const forecastBandHeight = forecastData.map((value) => {
    const lowerBound = Math.max(0, value - FORECAST_ERROR_BAND_KW)
    const upperBound = value + FORECAST_ERROR_BAND_KW
    return roundChartValue(upperBound - lowerBound)
  })
  const chartValues = [
    ...actualMeasurements.map((point) => point.powerKw),
    ...historicalForecastData,
    ...forecasts.map((point) => Math.max(0, point.predicted_power_kw - FORECAST_ERROR_BAND_KW)),
    ...forecasts.map((point) => point.predicted_power_kw),
    ...forecasts.map((point) => point.predicted_power_kw + FORECAST_ERROR_BAND_KW),
  ]
  const currentIndex = actualMeasurements.length > 0 ? actualMeasurements.length - 1 : -1

  return {
    color: ['#1d9e75', '#185fa5'],
    grid: { top: 16, right: 16, bottom: 34, left: 48 },
    graphic: !hasForecastChartData
      ? {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: forecastError || bridgeError || '예측 API 데이터 없음',
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
    legend: {
      data: ['실제 발전량', '예측 발전량'],
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
      min: 0,
      max: getPowerAxisMax(chartValues),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#c4c2bb', fontSize: 9 },
      splitLine: { lineStyle: { color: '#f5f3ef' } },
    },
    series: [
      {
        name: '실제 발전량',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        data: actualData,
      },
      {
        type: 'line',
        stack: 'forecast-error-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: forecastLowerBand,
      },
      {
        type: 'line',
        stack: 'forecast-error-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(24, 95, 165, 0.14)' },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: forecastBandHeight,
      },
      {
        name: '예측 발전량',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, type: 'dashed' },
        markLine: currentIndex >= 0
          ? {
              symbol: 'none',
              silent: true,
              lineStyle: { color: '#8e8c86', width: 1.5 },
              label: {
                show: true,
                formatter: '현재',
                position: 'insideEndBottom',
                color: '#8e8c86',
                fontSize: 11,
              },
              data: [{ xAxis: currentIndex }],
            }
          : undefined,
        data: forecastData,
      },
    ],
  }
}

function formatMonthDayTime(value: string) {
  const date = new Date(parseBackendDateTime(value))
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}.${day} ${hours}:${minutes}`
}

export function buildTimelineForecastChartOption(
  timeline: DashboardTimelineResponse | null,
  errorMessage: string,
): EChartsCoreOption {
  const actualSeries = Array.isArray(timeline?.actualSeries) ? timeline.actualSeries : []
  const predictionSeries = Array.isArray(timeline?.predictionSeries) ? timeline.predictionSeries : []
  const gapSeries = Array.isArray(timeline?.gapSeries) ? timeline.gapSeries : []
  const hasData = actualSeries.length > 0 || predictionSeries.length > 0

  if (!timeline || !hasData) {
    return {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: errorMessage || '타임라인 API 데이터 없음',
          fill: '#888780',
          fontSize: 13,
          fontWeight: 600,
        },
      },
    }
  }

  const tsSet = new Set<string>()
  actualSeries.forEach((point) => tsSet.add(point.measuredAt))
  predictionSeries.forEach((point) => tsSet.add(point.measuredAt))
  const tsList = [...tsSet].sort((a, b) => parseBackendDateTime(a) - parseBackendDateTime(b))
  const labels = tsList.map(formatMonthDayTime)
  const hasInsufficientPoints = tsList.length < 2

  const actualByTs = new Map(actualSeries.map((point) => [point.measuredAt, point.powerKw]))
  const predictionByTs = new Map(predictionSeries.map((point) => [point.measuredAt, point.powerKw]))
  const gapByTs = new Map(gapSeries.map((point) => [point.measuredAt, point.absoluteGap]))
  const fallbackGap = gapSeries.length > 0 ? Math.max(0, gapSeries[gapSeries.length - 1].absoluteGap) : 0

  const actualData = tsList.map((ts) => {
    const value = actualByTs.get(ts)
    return value == null ? null : roundChartValue(value)
  })

  const predictionData = tsList.map((ts) => {
    const value = predictionByTs.get(ts)
    return value == null ? null : roundChartValue(value)
  })

  const lowerBandData = tsList.map((ts) => {
    const prediction = predictionByTs.get(ts)
    if (prediction == null) {
      return null
    }
    const gap = Math.max(0, gapByTs.get(ts) ?? fallbackGap)
    return roundChartValue(Math.max(0, prediction - gap))
  })

  const bandHeightData = tsList.map((ts) => {
    const prediction = predictionByTs.get(ts)
    if (prediction == null) {
      return null
    }
    const gap = Math.max(0, gapByTs.get(ts) ?? fallbackGap)
    return roundChartValue(gap * 2)
  })

  const chartValues = [
    ...actualSeries.map((point) => point.powerKw),
    ...predictionSeries.map((point) => point.powerKw),
    ...predictionSeries.map((point) => Math.max(0, point.powerKw - fallbackGap)),
    ...predictionSeries.map((point) => point.powerKw + fallbackGap),
  ]

  const virtualNowMs = parseBackendDateTime(timeline.virtualNow)
  const currentIndex = tsList.length === 0
    ? -1
    : tsList.reduce((bestIndex, ts, index) => {
        const bestDiff = Math.abs(parseBackendDateTime(tsList[bestIndex]) - virtualNowMs)
        const currentDiff = Math.abs(parseBackendDateTime(ts) - virtualNowMs)
        return currentDiff < bestDiff ? index : bestIndex
      }, 0)

  return {
    color: ['#1d9e75', '#185fa5'],
    grid: { top: 16, right: 16, bottom: 34, left: 48 },
    graphic: hasInsufficientPoints
      ? {
          type: 'text',
          right: 16,
          top: 8,
          style: {
            text: '시계열 포인트 부족 (최소 2개 필요)',
            fill: '#a08f7b',
            fontSize: 11,
            fontWeight: 600,
          },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value} kW` : '-'),
    },
    legend: {
      data: ['실제 발전량', '예측 발전량', '오차범위'],
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
      axisLabel: { color: '#c4c2bb', fontSize: 9, hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: getPowerAxisMax(chartValues),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#c4c2bb', fontSize: 9 },
      splitLine: { lineStyle: { color: '#f5f3ef' } },
    },
    series: [
      {
        name: '실제 발전량',
        type: 'line',
        smooth: true,
        symbol: actualSeries.length < 2 ? 'circle' : 'none',
        symbolSize: actualSeries.length < 2 ? 8 : 0,
        lineStyle: { width: 3 },
        data: actualData,
      },
      {
        name: '오차범위-하한',
        type: 'line',
        stack: 'timeline-error-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: lowerBandData,
      },
      {
        name: '오차범위',
        type: 'line',
        stack: 'timeline-error-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(24, 95, 165, 0.14)' },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: bandHeightData,
      },
      {
        name: '예측 발전량',
        type: 'line',
        smooth: true,
        symbol: predictionSeries.length < 2 ? 'circle' : 'none',
        symbolSize: predictionSeries.length < 2 ? 8 : 0,
        lineStyle: { width: 3, type: 'dashed' },
        markLine: currentIndex >= 0
          ? {
              symbol: 'none',
              silent: true,
              lineStyle: { color: '#8e8c86', width: 1.5 },
              label: {
                show: true,
                formatter: '현재',
                position: 'insideEndBottom',
                color: '#8e8c86',
                fontSize: 11,
              },
              data: [{ xAxis: currentIndex }],
            }
          : undefined,
        data: predictionData,
      },
    ],
  }
}
