import type { EChartsCoreOption } from 'echarts/core'
import type { DashboardTimelineResponse, TimelineAnomalyMarker } from '@/api'
import { formatKoreanMonthDay, formatKoreanTime } from '@/shared/utils/dateFormat'

function parseBackendDateTime(value: string) {
  return new Date(value.endsWith('Z') ? value.slice(0, -1) : value).getTime()
}

function formatChartLabel(ts: string) {
  return `${formatKoreanMonthDay(ts)} ${formatKoreanTime(ts)}`
}

function findVirtualNowIndex(tsKeys: string[], virtualNow: string) {
  const targetMs = parseBackendDateTime(virtualNow)

  if (tsKeys.length === 0) {
    return -1
  }

  let bestIndex = 0
  let bestDiff = Number.POSITIVE_INFINITY

  tsKeys.forEach((ts, index) => {
    const diff = Math.abs(parseBackendDateTime(ts) - targetMs)

    if (diff < bestDiff) {
      bestDiff = diff
      bestIndex = index
    }
  })

  return bestIndex
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

function getMarkerColor(severity: string) {
  if (severity === 'HIGH') {
    return '#e24b4a'
  }

  if (severity === 'MEDIUM') {
    return '#ba7517'
  }

  return '#185fa5'
}

function buildCategoryAxis(timeline: DashboardTimelineResponse) {
  const labelSet = new Set<string>()

  timeline.actualSeries.forEach((point) => labelSet.add(point.ts))
  timeline.predictionSeries.forEach((point) => labelSet.add(point.ts))
  timeline.gapSeries.forEach((point) => labelSet.add(point.ts))

  const sorted = [...labelSet].sort((a, b) => parseBackendDateTime(a) - parseBackendDateTime(b))

  return {
    labels: sorted.map(formatChartLabel),
    tsKeys: sorted,
  }
}

function mapSeriesToCategories(tsKeys: string[], points: { ts: string; value: number }[]) {
  const valueByTs = new Map(points.map((point) => [point.ts, point.value]))

  return tsKeys.map((ts) => {
    const value = valueByTs.get(ts)

    return value == null ? null : roundChartValue(value)
  })
}

function mapGapToCategories(tsKeys: string[], timeline: DashboardTimelineResponse) {
  const gapByTs = new Map(timeline.gapSeries.map((point) => [point.ts, point.gapRate]))

  return tsKeys.map((ts) => {
    const rate = gapByTs.get(ts)

    return rate == null ? null : roundChartValue(rate * 100)
  })
}

export function buildDashboardTimelineChartOption(
  timeline: DashboardTimelineResponse | null,
  errorMessage: string,
): EChartsCoreOption {
  if (!timeline || (timeline.actualSeries.length === 0 && timeline.predictionSeries.length === 0)) {
    return {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: errorMessage || '타임라인 데이터 없음',
          fill: '#888780',
          fontSize: 13,
          fontWeight: 600,
        },
      },
    }
  }

  const { labels, tsKeys } = buildCategoryAxis(timeline)
  const actualData = mapSeriesToCategories(tsKeys, timeline.actualSeries)
  const predictionData = mapSeriesToCategories(tsKeys, timeline.predictionSeries)
  const gapData = mapGapToCategories(tsKeys, timeline)

  const chartValues = [
    ...timeline.actualSeries.map((point) => point.value),
    ...timeline.predictionSeries.map((point) => point.value),
  ]

  const virtualNowIndex = findVirtualNowIndex(tsKeys, timeline.virtualNow)

  const markerScatterData = timeline.anomalyMarkers
    .map((marker) => {
      const index = tsKeys.indexOf(marker.ts)

      if (index < 0) {
        return null
      }

      const actualValue = timeline.actualSeries.find((point) => point.ts === marker.ts)?.value
      const predictionValue = timeline.predictionSeries.find((point) => point.ts === marker.ts)?.value
      const yValue = actualValue ?? predictionValue ?? 0

      return {
        value: [index, roundChartValue(yValue)],
        eventId: marker.eventId,
        marker,
        itemStyle: { color: getMarkerColor(marker.severity) },
      }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)

  return {
    color: ['#1d9e75', '#185fa5', 'rgba(226, 75, 74, 0.25)'],
    grid: { top: 24, right: 16, bottom: 34, left: 48 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value}` : '-'),
    },
    legend: {
      data: ['실제 발전량', '예측 발전량', '괴리율(%)', '이상 이벤트'],
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
    yAxis: [
      {
        type: 'value',
        name: 'kW',
        min: 0,
        max: getPowerAxisMax(chartValues),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#c4c2bb', fontSize: 9 },
        splitLine: { lineStyle: { color: '#f5f3ef' } },
      },
      {
        type: 'value',
        name: '괴리%',
        min: 0,
        max: 100,
        show: false,
      },
    ],
    series: [
      {
        name: '실제 발전량',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3 },
        data: actualData,
        markLine:
          virtualNowIndex >= 0
            ? {
                symbol: 'none',
                lineStyle: { color: '#5f5e5a', type: 'dashed', width: 1 },
                label: { formatter: '현재', fontSize: 9 },
                data: [{ xAxis: virtualNowIndex }],
              }
            : undefined,
      },
      {
        name: '예측 발전량',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 3, type: 'dashed' },
        data: predictionData,
      },
      {
        name: '괴리율(%)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1, opacity: 0.6 },
        areaStyle: { color: 'rgba(226, 75, 74, 0.12)' },
        data: gapData,
      },
      {
        name: '이상 이벤트',
        type: 'scatter',
        symbolSize: 12,
        data: markerScatterData,
        tooltip: {
          formatter: (params: { data?: { marker?: TimelineAnomalyMarker } }) => {
            const marker = params.data?.marker

            if (!marker) {
              return ''
            }

            return `${marker.summary}<br/>${marker.severity} · ${marker.status}`
          },
        },
      },
    ],
  }
}

export type TimelineChartClickParams = {
  componentType?: string
  seriesName?: string
  data?: {
    eventId?: number
    marker?: TimelineAnomalyMarker
  }
}

export function extractMarkerFromChartClick(params: TimelineChartClickParams): TimelineAnomalyMarker | null {
  if (params.seriesName !== '이상 이벤트' || !params.data?.marker) {
    return null
  }

  return params.data.marker
}
