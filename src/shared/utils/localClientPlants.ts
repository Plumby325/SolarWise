import type { Plant } from '@/api'

export type ClientRegisteredPlant = Plant & {
  registeredAtIso: string
  installYear: number
}

export type NewPlantPayload = {
  name: string
  sido: string
  sigungu: string
  capacityKw: number
  installYear: number
  inverterModel: string
  sensorSerial: string
}

function storageKey(userId: number | undefined) {
  return `solarwise-client-plants:${userId ?? 'guest'}`
}

export function isClientRegisteredPlant(plant: Plant): plant is ClientRegisteredPlant {
  return 'registeredAtIso' in plant && typeof (plant as ClientRegisteredPlant).registeredAtIso === 'string'
}

export function loadClientPlants(userId: number | undefined): ClientRegisteredPlant[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((row): row is ClientRegisteredPlant => {
      if (!row || typeof row !== 'object') {
        return false
      }
      const r = row as Record<string, unknown>
      return (
        typeof r.plantId === 'number'
        && typeof r.name === 'string'
        && typeof r.location === 'string'
        && typeof r.capacityKw === 'number'
        && typeof r.status === 'string'
        && typeof r.registeredAtIso === 'string'
        && typeof r.installYear === 'number'
      )
    })
  } catch {
    return []
  }
}

export function saveClientPlants(userId: number | undefined, plants: ClientRegisteredPlant[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(plants))
}
