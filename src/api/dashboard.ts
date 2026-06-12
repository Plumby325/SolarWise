import { apiClient } from './client'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type MeasurementPoint = {
  measuredAt: string
  powerKw: number
  temperature: number | null
  irradiance: number | null
  humidity: number | null
}

export type MeasurementSeries = {
  plantId: number
  series: MeasurementPoint[]
}

export type Plant = {
  plantId: number
  name: string
  location: string
  capacityKw: number
  status: string
  inverterModel: string | null
  sensorSerialNumber: string | null
}

export type DashboardSummary = {
  currentPowerKw: number
  todayGenerationKwh: number
  efficiencyPercent: number
  lastUpdatedAt: string
  latestAnomaly: {
    exists: boolean
    eventId?: number
    severity?: string
    summary?: string
  }
}

export type ForecastPoint = {
  target_time: string
  predicted_power_kw: number
  confidence: number | null
  model_version: string | null
  model_notes: string | null
}

export type XaiExplanationPoint = {
  feature_importance: Record<string, number> | null
  shap_values: Record<string, number> | null
  lime_explanation: string | null
  model_confidence: number | null
  explanation_text: string | null
}

export type ForecastResponse = {
  plant_id: string
  forecast_series: ForecastPoint[]
  explanations?: XaiExplanationPoint[]
}

export type ForecastExplanationResponse = {
  plant_id: string
  explanations: XaiExplanationPoint[]
}

export type AnomalyEvent = {
  eventId: number
  type: 'POWER' | 'VISION' | string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string
  detectedAt: string
  summary: string
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | string
  cause: string | null
  recommendedAction: string | null
  xaiExplanation: string | null
  imageUrl?: string | null
  heatmapUrl?: string | null
}

export type UpdateAnomalyStatusResponse = {
  eventId: number
  status: AnomalyEvent['status']
}

export type TimelineRange = 'DAY' | 'WEEK' | 'MONTH'

export type TimelineTimePoint = {
  measuredAt: string
  powerKw: number
  temperature?: number | null
  irradiance?: number | null
  humidity?: number | null
}

export type TimelineGapPoint = {
  measuredAt: string
  absoluteGap: number
  gapRate: number
}

export type TimelineAnomalyMarker = {
  eventId: number
  detectedAt: string
  type?: string
  severity: string
  status?: string
  summary: string
}

export type DashboardTimelineResponse = {
  plantId: number
  range: TimelineRange
  virtualNow: string
  windowStart: string
  windowEnd: string
  forecastEnd: string
  lastUpdatedAt: string
  actualSeries: TimelineTimePoint[]
  predictionSeries: TimelineTimePoint[]
  gapSeries: TimelineGapPoint[]
  anomalyMarkers: TimelineAnomalyMarker[]
}

export type DashboardTimelineQuery = {
  range?: TimelineRange
  futureHours?: number
  to?: string
}

function normalizeTimelineResponse(raw: unknown): DashboardTimelineResponse {
  const source = (raw ?? {}) as Record<string, unknown>
  const actualSeriesRaw = Array.isArray(source.actualSeries)
    ? source.actualSeries
    : Array.isArray(source.actual_series)
      ? source.actual_series
      : []
  const predictionSeriesRaw = Array.isArray(source.predictionSeries)
    ? source.predictionSeries
    : Array.isArray(source.prediction_series)
      ? source.prediction_series
      : []
  const gapSeriesRaw = Array.isArray(source.gapSeries)
    ? source.gapSeries
    : Array.isArray(source.gap_series)
      ? source.gap_series
      : []
  const anomalyMarkersRaw = Array.isArray(source.anomalyMarkers)
    ? source.anomalyMarkers
    : Array.isArray(source.anomaly_markers)
      ? source.anomaly_markers
      : []

  const normalizeMeasuredAt = (row: Record<string, unknown>) => {
    if (typeof row.measuredAt === 'string') {
      return row.measuredAt
    }
    if (typeof row.measured_at === 'string') {
      return row.measured_at
    }
    if (typeof row.ts === 'string') {
      return row.ts
    }
    return null
  }

  const normalizePowerKw = (row: Record<string, unknown>) => {
    if (typeof row.powerKw === 'number') {
      return row.powerKw
    }
    if (typeof row.power_kw === 'number') {
      return row.power_kw
    }
    if (typeof row.value === 'number') {
      return row.value
    }
    return null
  }

  const normalizeGap = (row: Record<string, unknown>) => {
    if (typeof row.absoluteGap === 'number') {
      return row.absoluteGap
    }
    if (typeof row.absolute_gap === 'number') {
      return row.absolute_gap
    }
    if (typeof row.absGap === 'number') {
      return row.absGap
    }
    if (typeof row.abs_gap === 'number') {
      return row.abs_gap
    }
    return null
  }

  const normalizeGapRate = (row: Record<string, unknown>) => {
    if (typeof row.gapRate === 'number') {
      return row.gapRate
    }
    if (typeof row.gap_rate === 'number') {
      return row.gap_rate
    }
    return null
  }

  const normalizeLooseNumber = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
    return null
  }

  const normalizeDetectedAt = (row: Record<string, unknown>) => {
    if (typeof row.detectedAt === 'string') {
      return row.detectedAt
    }
    if (typeof row.detected_at === 'string') {
      return row.detected_at
    }
    if (typeof row.ts === 'string') {
      return row.ts
    }
    return null
  }

  return {
    plantId: typeof source.plantId === 'number' ? source.plantId : Number(source.plant_id ?? 0),
    range: (typeof source.range === 'string' ? source.range : 'DAY') as TimelineRange,
    virtualNow: typeof source.virtualNow === 'string' ? source.virtualNow : String(source.virtual_now ?? ''),
    windowStart: typeof source.windowStart === 'string' ? source.windowStart : String(source.window_start ?? ''),
    windowEnd: typeof source.windowEnd === 'string' ? source.windowEnd : String(source.window_end ?? ''),
    forecastEnd: typeof source.forecastEnd === 'string' ? source.forecastEnd : String(source.forecast_end ?? ''),
    lastUpdatedAt: typeof source.lastUpdatedAt === 'string'
      ? source.lastUpdatedAt
      : typeof source.last_updated_at === 'string'
        ? source.last_updated_at
        : typeof source.virtualNow === 'string'
          ? source.virtualNow
          : String(source.virtual_now ?? ''),
    actualSeries: actualSeriesRaw
      .map((point): TimelineTimePoint | null => {
        if (!point || typeof point !== 'object') {
          return null
        }
        const row = point as Record<string, unknown>
        const measuredAt = normalizeMeasuredAt(row)
        const powerKw = normalizePowerKw(row)
        if (!measuredAt || powerKw == null) {
          return null
        }
        return {
          measuredAt,
          powerKw,
          temperature: typeof row.temperature === 'number' ? row.temperature : null,
          irradiance: typeof row.irradiance === 'number' ? row.irradiance : null,
          humidity: typeof row.humidity === 'number' ? row.humidity : null,
        }
      })
      .filter((point): point is TimelineTimePoint => point != null),
    predictionSeries: predictionSeriesRaw
      .map((point): TimelineTimePoint | null => {
        if (!point || typeof point !== 'object') {
          return null
        }
        const row = point as Record<string, unknown>
        const measuredAt = normalizeMeasuredAt(row)
        const powerKw = normalizePowerKw(row)
        if (!measuredAt || powerKw == null) {
          return null
        }
        return { measuredAt, powerKw }
      })
      .filter((point): point is TimelineTimePoint => point != null),
    gapSeries: gapSeriesRaw
      .map((point): TimelineGapPoint | null => {
        if (!point || typeof point !== 'object') {
          return null
        }
        const row = point as Record<string, unknown>
        const measuredAt = normalizeMeasuredAt(row)
        const actual =
          normalizeLooseNumber(row.actual)
          ?? normalizeLooseNumber(row.actualPowerKw)
          ?? normalizeLooseNumber(row.actual_power_kw)
        const prediction =
          normalizeLooseNumber(row.prediction)
          ?? normalizeLooseNumber(row.predictionPowerKw)
          ?? normalizeLooseNumber(row.prediction_power_kw)

        const absoluteGapFromPayload = normalizeGap(row)
        const absoluteGap = absoluteGapFromPayload != null
          ? absoluteGapFromPayload
          : (actual != null && prediction != null ? Math.abs(actual - prediction) : null)

        if (!measuredAt || absoluteGap == null) {
          return null
        }

        const rawGapRate = normalizeGapRate(row)
        const gapRate = rawGapRate != null
          ? rawGapRate
          : (prediction != null && prediction > 0 ? absoluteGap / prediction : 0)

        return { measuredAt, absoluteGap, gapRate }
      })
      .filter((point): point is TimelineGapPoint => point != null),
    anomalyMarkers: anomalyMarkersRaw
      .map((marker): TimelineAnomalyMarker | null => {
        if (!marker || typeof marker !== 'object') {
          return null
        }
        const row = marker as Record<string, unknown>
        const eventId = typeof row.eventId === 'number'
          ? row.eventId
          : typeof row.event_id === 'number'
            ? row.event_id
            : null
        const detectedAt = normalizeDetectedAt(row)
        if (
          eventId == null
          || !detectedAt
          || typeof row.severity !== 'string'
          || typeof row.summary !== 'string'
        ) {
          return null
        }
        return {
          eventId,
          detectedAt,
          type: typeof row.type === 'string' ? row.type : undefined,
          severity: row.severity,
          status: typeof row.status === 'string' ? row.status : undefined,
          summary: row.summary,
        }
      })
      .filter((marker): marker is TimelineAnomalyMarker => marker != null),
  }
}

export function getDashboardTimeline(plantId: number, query: DashboardTimelineQuery = {}) {
  const params = new URLSearchParams()

  if (query.range) {
    params.set('range', query.range)
  }

  if (query.futureHours != null) {
    params.set('futureHours', String(query.futureHours))
  }

  if (query.to) {
    params.set('to', query.to)
  }

  const qs = params.toString()
  return apiClient<ApiResponse<unknown>>(
    `/api/v1/plants/${plantId}/dashboard/timeline${qs ? `?${qs}` : ''}`,
  ).then((response) => ({
    ...response,
    data: normalizeTimelineResponse(response.data),
  }))
}

export function getMeasurements(plantId: number, from?: string, to?: string) {
  const params = new URLSearchParams()

  if (from) {
    params.set('from', from)
  }

  if (to) {
    params.set('to', to)
  }

  const query = params.toString()
  return apiClient<ApiResponse<MeasurementSeries>>(`/api/v1/plants/${plantId}/measurements${query ? `?${query}` : ''}`)
}

export function getDashboardSummary(plantId: number) {
  return apiClient<ApiResponse<DashboardSummary>>(`/api/v1/plants/${plantId}/dashboard/summary`)
}

export function getForecast(plantId: number) {
  return apiClient<ApiResponse<unknown>>(`/api/v1/plants/${plantId}/forecasts`).then((response) => {
    const source = (response.data ?? {}) as Record<string, unknown>
    const rawSeries = Array.isArray(source.forecast_series)
      ? source.forecast_series
      : Array.isArray(source.series)
        ? source.series
        : []

    const forecastSeries = rawSeries
      .map((item) => {
        if (!item || typeof item !== 'object') {
          return null
        }
        const row = item as Record<string, unknown>
        const targetTime = typeof row.target_time === 'string'
          ? row.target_time
          : typeof row.targetTime === 'string'
            ? row.targetTime
            : null
        const predictedPowerKw = typeof row.predicted_power_kw === 'number'
          ? row.predicted_power_kw
          : typeof row.predictedPowerKw === 'number'
            ? row.predictedPowerKw
            : null
        if (!targetTime || predictedPowerKw == null) {
          return null
        }
        return {
          target_time: targetTime,
          predicted_power_kw: predictedPowerKw,
          confidence: typeof row.confidence === 'number' ? row.confidence : null,
          model_version: typeof row.model_version === 'string' ? row.model_version : null,
          model_notes: typeof row.model_notes === 'string' ? row.model_notes : null,
        } as ForecastPoint
      })
      .filter((item): item is ForecastPoint => item != null)

    const normalized: ForecastResponse = {
      plant_id: typeof source.plant_id === 'string' ? source.plant_id : String(source.plantId ?? plantId),
      forecast_series: forecastSeries,
      explanations: Array.isArray(source.explanations) ? (source.explanations as XaiExplanationPoint[]) : [],
    }

    return {
      ...response,
      data: normalized,
    }
  })
}

export function getForecastExplanation(plantId: number) {
  return apiClient<ApiResponse<ForecastExplanationResponse>>(`/api/v1/plants/${plantId}/forecasts/explanations`)
}

export function getAnomalies(plantId: number, limit = 5) {
  return apiClient<ApiResponse<AnomalyEvent[]>>(`/api/v1/plants/${plantId}/anomalies?limit=${limit}`)
}

export function getAnomalyDetail(plantId: number, eventId: number) {
  return apiClient<ApiResponse<AnomalyEvent>>(`/api/v1/plants/${plantId}/anomalies/${eventId}`)
}

/**
 * 이상 이벤트 상태 변경 — 백엔드 {@code PATCH /api/v1/plants/{plantId}/anomalies/{eventId}/status}
 * 요청 본문: {@code { "status": "OPEN" | "ACKNOWLEDGED" | "RESOLVED" }}
 */
export function updateAnomalyStatus(plantId: number, eventId: number, status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED') {
  return apiClient<ApiResponse<UpdateAnomalyStatusResponse>>(`/api/v1/plants/${plantId}/anomalies/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getPlants() {
  return apiClient<ApiResponse<Plant[]>>('/api/v1/plants')
}

/** API `panelCount` 필수 충족용 — 대략 450W/패널 가정 */
export function estimatePanelCountFromCapacityKw(capacityKw: number): number {
  return Math.max(1, Math.round((capacityKw * 1000) / 450))
}

export type CreatePlantBody = {
  name: string
  location: string
  capacityKw: number
  panelCount: number
  inverterModel: string
  sensorSerialNumber?: string | null
}

export function createPlant(body: CreatePlantBody) {
  const payload = {
    name: body.name,
    location: body.location,
    capacityKw: body.capacityKw,
    panelCount: body.panelCount,
    inverterModel: body.inverterModel,
    ...(body.sensorSerialNumber?.trim()
      ? { sensorSerialNumber: body.sensorSerialNumber.trim() }
      : {}),
  }
  return apiClient<ApiResponse<Plant>>('/api/v1/plants', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
