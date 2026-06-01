export { apiClient } from './client'
export {
  createPlant,
  estimatePanelCountFromCapacityKw,
  getAnomalies,
  getAnomalyDetail,
  getDashboardSummary,
  getDashboardTimeline,
  getForecast,
  getMeasurements,
  getPlants,
  updateAnomalyStatus,
} from './dashboard'
export {
  getPlaybackStatus,
  getSimulationTime,
  startPlayback,
  stopPlayback,
  triggerPowerAnomaly,
} from './simulation'
export { login, saveAuthSession, signup, getCurrentUser } from './auth'
export type {
  AnomalyEvent,
  CreatePlantBody,
  DashboardSummary,
  DashboardTimelineQuery,
  DashboardTimelineResponse,
  ForecastPoint,
  ForecastResponse,
  MeasurementPoint,
  MeasurementSeries,
  Plant,
  TimelineAnomalyMarker,
  TimelineGapPoint,
  TimelineRange,
  TimelineTimePoint,
  UpdateAnomalyStatusResponse,
} from './dashboard'
export type { PowerAnomalyTriggerBody, SimulationPlaybackStatus } from './simulation'
export type { LoginRequest, LoginResponse, SignupRequest, UserResponse } from './auth'
