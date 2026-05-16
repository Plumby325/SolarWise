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

export type ForecastResponse = {
  plant_id: string
  forecast_series: ForecastPoint[]
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
}

export type UpdateAnomalyStatusResponse = {
  eventId: number
  status: AnomalyEvent['status']
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
  return apiClient<ApiResponse<ForecastResponse>>(`/api/v1/plants/${plantId}/forecasts`)
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
