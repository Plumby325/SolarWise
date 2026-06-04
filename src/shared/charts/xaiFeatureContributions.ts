import type { XaiExplanationPoint } from '@/api'

export type ShapFeatureContribution = {
  label: string
  value: number
  color: string
}

const FEATURE_LABEL_MAP: Record<string, string> = {
  irradiance: '일사량',
  solar_irradiance: '일사량',
  temperature: '기온',
  ambient_temperature: '기온',
  humidity: '습도',
  cloud_cover: '운량',
  cloud: '운량',
  panel_state: '패널 상태',
  panel_surface_state: '패널 상태',
  actual_vs_predicted_gap: '출력 편차',
  power_drop_rate: '출력 편차',
}

const FEATURE_COLOR_MAP: Record<string, string> = {
  일사량: '#185fa5',
  기온: '#1d9e75',
  운량: '#e24b4a',
  '패널 상태': '#ba7517',
  '출력 편차': '#5f5e5a',
  습도: '#3b82f6',
}

export const DEFAULT_SHAP_FEATURE_CONTRIBUTIONS: ShapFeatureContribution[] = [
  { label: '일사량', value: 0.52, color: '#185fa5' },
  { label: '기온', value: 0.28, color: '#1d9e75' },
  { label: '운량', value: -0.15, color: '#e24b4a' },
  { label: '패널 상태', value: 0.1, color: '#ba7517' },
]

function normalizeFeatureLabel(rawKey: string) {
  return FEATURE_LABEL_MAP[rawKey] ?? rawKey
}

export function deriveShapFeatureContributions(
  explanations: XaiExplanationPoint[],
  fallback: ShapFeatureContribution[] = DEFAULT_SHAP_FEATURE_CONTRIBUTIONS,
) {
  const aggregated = new Map<string, number>()

  explanations.forEach((item) => {
    const source = item.feature_importance ?? item.shap_values ?? {}
    Object.entries(source).forEach(([key, value]) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return
      }
      const label = normalizeFeatureLabel(key)
      aggregated.set(label, (aggregated.get(label) ?? 0) + value)
    })
  })

  if (aggregated.size === 0) {
    return fallback
  }

  return [...aggregated.entries()]
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value,
      color: FEATURE_COLOR_MAP[label] ?? '#185fa5',
    }))
}
