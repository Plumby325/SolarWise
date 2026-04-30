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

export function getForecast(plantId: number) {
  return apiClient<ApiResponse<ForecastResponse>>(`/api/v1/plants/${plantId}/forecasts`)
}
