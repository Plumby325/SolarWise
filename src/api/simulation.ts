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
  return apiClient<ApiResponse<AnomalyEvent>>('/api/v1/simulation/trigger-power-anomaly', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function triggerVisionAnomaly(body: VisionAnomalyTriggerBody) {
  return apiClient<ApiResponse<AnomalyEvent>>('/api/v1/simulation/trigger-vision-anomaly', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
