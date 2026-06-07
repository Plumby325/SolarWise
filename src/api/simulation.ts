import { apiClient } from './client'
import type { AnomalyEvent } from './dashboard'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type SimulationPlaybackStatus = {
  running: boolean
  tickSeconds: number
  stepHours: number
  virtualCurrentTime: string
  lastTickAt: string | null
}

export type PowerAnomalyTriggerBody = {
  plantId: number
  anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH'
  differencePercentage?: number
  durationHours?: number
  description?: string
}

export type VisionAnomalyTriggerBody = {
  plantId: number
  anomalyType: 'CRACK' | 'DIRT' | string
  anomalySeverity?: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number
  imageUrl?: string
  xaiExplanation?: string
}

export function getSimulationTime() {
  return apiClient<ApiResponse<string>>('/api/v1/simulation/time')
}

export function getPlaybackStatus() {
  return apiClient<ApiResponse<SimulationPlaybackStatus>>('/api/v1/simulation/playback/status')
}

export function startPlayback() {
  return apiClient<ApiResponse<SimulationPlaybackStatus>>('/api/v1/simulation/playback/start', {
    method: 'POST',
  })
}

export function stopPlayback() {
  return apiClient<ApiResponse<SimulationPlaybackStatus>>('/api/v1/simulation/playback/stop', {
    method: 'POST',
  })
}

export function triggerPowerAnomaly(body: PowerAnomalyTriggerBody) {
  const scenarioPath = body.anomalySeverity === 'MEDIUM'
    ? '/api/v1/simulation/scenarios/power-medium'
    : '/api/v1/simulation/scenarios/power-high'

  const toAnomaly = (response: ApiResponse<AnomalyEvent | string>) => ({
    success: response.success,
    message: response.message,
    data: typeof response.data === 'string'
      ? ({
          eventId: 0,
          type: 'POWER',
          severity: body.anomalySeverity,
          detectedAt: new Date().toISOString(),
          summary: response.data,
          status: 'OPEN',
          cause: null,
          recommendedAction: null,
          xaiExplanation: null,
        } as AnomalyEvent)
      : (response.data as AnomalyEvent),
  })

  return apiClient<ApiResponse<AnomalyEvent | string>>(scenarioPath, {
    method: 'POST',
  })
    .then(toAnomaly)
}

export function triggerVisionAnomaly(body: VisionAnomalyTriggerBody) {
  const payload = {
    ...body,
    anomalySeverity: body.anomalySeverity ?? (body.anomalyType === 'CRACK' ? 'HIGH' : 'MEDIUM'),
  }
  const scenarioPath = payload.anomalyType === 'CRACK'
    ? '/api/v1/simulation/scenarios/vision-crack'
    : '/api/v1/simulation/scenarios/vision-dirt'

  const toAnomaly = (response: ApiResponse<AnomalyEvent | string>) => ({
    success: response.success,
    message: response.message,
    data: typeof response.data === 'string'
      ? ({
          eventId: 0,
          type: 'VISION',
          severity: payload.anomalySeverity,
          detectedAt: new Date().toISOString(),
          summary: response.data,
          status: 'OPEN',
          cause: null,
          recommendedAction: null,
          xaiExplanation: payload.xaiExplanation ?? null,
        } as AnomalyEvent)
      : (response.data as AnomalyEvent),
  })

  return apiClient<ApiResponse<AnomalyEvent | string>>(scenarioPath, {
    method: 'POST',
  })
    .then(toAnomaly)
}
