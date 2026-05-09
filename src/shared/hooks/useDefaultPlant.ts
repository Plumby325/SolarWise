import { useEffect, useMemo, useState } from 'react'
import { getPlants } from '@/api'
import type { Plant } from '@/api'

type UseDefaultPlantOptions = {
  refreshKey?: unknown
}

export function useDefaultPlant({ refreshKey }: UseDefaultPlantOptions = {}) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    setIsLoading(true)
    getPlants()
      .then((response) => {
        if (!isActive) {
          return
        }

        setPlants(response.data)
        setErrorMessage(response.data.length === 0 ? '조회 가능한 발전소가 없습니다.' : '')
        setIsLoading(false)
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        setPlants([])
        setErrorMessage(error instanceof Error ? error.message : '발전소 목록을 불러오지 못했습니다.')
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [refreshKey])

  const defaultPlant = useMemo(() => plants[0] ?? null, [plants])

  return {
    plants,
    defaultPlant,
    defaultPlantId: defaultPlant?.plantId ?? null,
    isLoading,
    errorMessage,
  }
}
