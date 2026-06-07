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

  timeline.actualSeries.forEach((point) => labelSet.add(point.measuredAt))
  timeline.predictionSeries.forEach((point) => labelSet.add(point.measuredAt))
  timeline.gapSeries.forEach((point) => labelSet.add(point.measuredAt))

  const sorted = [...labelSet].sort((a, b) => parseBackendDateTime(a) - parseBackendDateTime(b))

  return {
    labels: sorted.map(formatChartLabel),
    tsKeys: sorted,
  }
}

function mapSeriesToCategories(tsKeys: string[], points: { measuredAt: string; powerKw: number }[]) {
  const valueByTs = new Map(points.map((point) => [point.measuredAt, point.powerKw]))

  return tsKeys.map((ts) => {
    const value = valueByTs.get(ts)

    return value == null ? null : roundChartValue(value)
  })
}

function getP95(values: number[]) {
  if (values.length === 0) {
    return null
  }
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.floor((sorted.length - 1) * 0.95)
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
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
  const actualByTs = new Map(timeline.actualSeries.map((point) => [point.measuredAt, point.powerKw]))
  const predictionByTs = new Map(timeline.predictionSeries.map((point) => [point.measuredAt, point.powerKw]))
  const gapByTs = new Map(timeline.gapSeries.map((point) => [point.measuredAt, point.absoluteGap]))
  const rawGapValues = tsKeys
    .map((ts) => {
      const actual = actualByTs.get(ts)
      const prediction = predictionByTs.get(ts)
      if (actual == null || prediction == null) {
        return null
      }
      return gapByTs.get(ts) ?? Math.abs(actual - prediction)
    })
    .filter((value): value is number => value != null && Number.isFinite(value))
  const gapP95 = getP95(rawGapValues)
  const gapDisplayCap = gapP95 != null ? Math.max(gapP95, 1) : null

  const gapAreaBaseData = tsKeys.map((ts) => {
    const actual = actualByTs.get(ts)
    const prediction = predictionByTs.get(ts)
    if (actual == null || prediction == null) {
      return null
    }
    return roundChartValue(Math.min(actual, prediction))
  })
  const gapAreaHeightData = tsKeys.map((ts) => {
    const actual = actualByTs.get(ts)
    const prediction = predictionByTs.get(ts)
    if (actual == null || prediction == null) {
      return null
    }
    const rawGap = gapByTs.get(ts) ?? Math.abs(actual - prediction)
    const clampedGap = gapDisplayCap == null ? rawGap : Math.min(rawGap, gapDisplayCap)
    return roundChartValue(clampedGap)
  })

  const chartValues = [
    ...timeline.actualSeries.map((point) => point.powerKw),
    ...timeline.predictionSeries.map((point) => point.powerKw),
  ]

  const virtualNowIndex = findVirtualNowIndex(tsKeys, timeline.virtualNow)

  const markerScatterData = timeline.anomalyMarkers
    .map((marker) => {
      const index = tsKeys.indexOf(marker.detectedAt)

      if (index < 0) {
        return null
      }

      const actualValue = timeline.actualSeries.find((point) => point.measuredAt === marker.detectedAt)?.powerKw
      const predictionValue = timeline.predictionSeries.find((point) => point.measuredAt === marker.detectedAt)?.powerKw
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
    color: ['#1d9e75', '#185fa5', 'rgba(226, 75, 74, 0.2)'],
    grid: { top: 24, right: 16, bottom: 34, left: 48 },
    tooltip: {
      trigger: 'axis',
      formatter: (params: Array<{ dataIndex?: number }>) => {
        const first = params[0]
        const dataIndex = first?.dataIndex
        if (dataIndex == null || dataIndex < 0 || dataIndex >= tsKeys.length) {
          return ''
        }
        const ts = tsKeys[dataIndex]
        const actual = actualByTs.get(ts)
        const prediction = predictionByTs.get(ts)
        const absGap = actual != null && prediction != null
          ? (gapByTs.get(ts) ?? Math.abs(actual - prediction))
          : null
        const gapRate = actual != null && prediction != null && prediction > 0
          ? absGap! / prediction
          : null

        return [
          `<strong>${formatChartLabel(ts)}</strong>`,
          `실측: ${actual != null ? `${roundChartValue(actual)} kW` : '-'}`,
          `예측: ${prediction != null ? `${roundChartValue(prediction)} kW` : '-'}`,
          `괴리: ${absGap != null ? `${roundChartValue(absGap)} kW` : '-'}`,
          `괴리율: ${gapRate != null ? `${roundChartValue(gapRate * 100)}%` : '-'}`,
        ].join('<br/>')
      },
    },
    legend: {
      data: ['실제 발전량', '예측 발전량', '괴리영역', '이상 이벤트'],
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
      name: 'kW',
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
        name: '괴리영역-기준선',
        type: 'line',
        stack: 'gap-area',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: gapAreaBaseData,
      },
      {
        name: '괴리영역',
        type: 'line',
        stack: 'gap-area',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(226, 75, 74, 0.12)' },
        emphasis: { disabled: true },
        tooltip: { show: false },
        data: gapAreaHeightData,
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

            return `${marker.summary}<br/>${marker.severity}${marker.status ? ` · ${marker.status}` : ''}`
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
