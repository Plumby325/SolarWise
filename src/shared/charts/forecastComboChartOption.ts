import type { EChartsCoreOption } from 'echarts/core'
import type { ForecastPoint, MeasurementPoint } from '@/api'
import { formatKoreanMonthDay } from '@/shared/utils/dateFormat'

/** 예측 차트 실측 브릿지용: 항상 이 구간만 조회 (실시간 차트 1h/12h/1d와 무관) */
export const FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS = 24 * 60 * 60 * 1000

export const FORECAST_BRIDGE_TAIL_COUNT = 5

export type ForecastHorizonId = 'today' | '2d' | '3d'

function parseBackendDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function formatChartDateLabel(value: string) {
  return formatKoreanMonthDay(value)
}

function roundChartValue(value: number) {
  return Number(value.toFixed(1))
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

export function createDummyBridgeMeasurements(): MeasurementPoint[] {
  const intervalMs = 60 * 60 * 1000
  const durationMs = FORECAST_BRIDGE_MEASUREMENT_WINDOW_MS
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

export function createDummyForecastSeries(): ForecastPoint[] {
  const startTime = Date.now() + 60 * 60 * 1000
  const intervalMs = 6 * 60 * 60 * 1000

  return Array.from({ length: 8 }, (_, index) => {
    const curve = Math.sin(((index % 4) + 1) / 5 * Math.PI)

    return {
      target_time: new Date(startTime + intervalMs * index).toISOString(),
      predicted_power_kw: Math.max(0, 2600 + curve * 6200 - Math.floor(index / 4) * 350),
      confidence: 0.9 - index * 0.015,
      model_version: 'Dummy-XGBoost',
      model_notes: 'API 데이터 없음 - 프론트 더미 데이터',
    }
  })
}

/**
 * 대시보드·발전량 예측 공통: 실측(끝)·예측 선 결합 ECharts 옵션
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
  const latestActualMeasurement = actualMeasurements[actualMeasurements.length - 1]
  const hasForecastChartData = actualMeasurements.length > 0 || forecasts.length > 0
  const labels = [
    ...actualMeasurements.map((point) => formatChartDateLabel(point.measuredAt)),
    ...forecasts.map((point) => formatChartDateLabel(point.target_time)),
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
  const chartValues = [
    ...actualMeasurements.map((point) => point.powerKw),
    ...forecasts.map((point) => point.predicted_power_kw),
  ]

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
}
