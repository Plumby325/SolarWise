import { useCallback, useEffect, useState } from 'react'
import { getDashboardTimeline, getPlaybackStatus } from '@/api'
import type { DashboardTimelineResponse, SimulationPlaybackStatus, TimelineRange } from '@/api'
import { SIMULATION_CHANGE_EVENT } from '@/shared/layout/DashboardSidebar'

const POLL_FAST_MS = 5000
const POLL_SLOW_MS = 5000

export function useDashboardTimeline(plantId: number | null, refreshKey = 0) {
  const [range, setRange] = useState<TimelineRange>('DAY')
  const [timeline, setTimeline] = useState<DashboardTimelineResponse | null>(null)
  const [playback, setPlayback] = useState<SimulationPlaybackStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthError, setIsAuthError] = useState(false)
  const [futureHours, setFutureHours] = useState<number | undefined>(undefined)

  const refresh = useCallback(async () => {
    if (!plantId) {
      setTimeline(null)
      setPlayback(null)
      setError('발전소 데이터 없음')
      setIsAuthError(false)
      return
    }

    setIsLoading(true)

    try {
      const [timelineResponse, playbackResponse] = await Promise.all([
        getDashboardTimeline(plantId, { range, futureHours }),
        getPlaybackStatus(),
      ])
      setTimeline((prev) => {
        if (prev?.lastUpdatedAt === timelineResponse.data.lastUpdatedAt) {
          return prev
        }
        return timelineResponse.data
      })
      setPlayback(playbackResponse.data)
      setError('')
      setIsAuthError(false)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : '타임라인 조회 실패'
      const isUnauthorized = message.includes('401') || /unauthor|forbidden/i.test(message)
      if (isUnauthorized) {
        setIsAuthError(true)
        setError('인증이 만료되어 타임라인 폴링을 중단했습니다. 다시 로그인해주세요.')
        setTimeline(null)
        setPlayback(null)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [futureHours, plantId, range])

  useEffect(() => {
    if (!plantId) {
      setTimeline(null)
      setPlayback(null)
      setError('발전소 데이터 없음')
      return undefined
    }
    if (isAuthError) {
      return undefined
    }

    let isActive = true
    let timerId: ReturnType<typeof window.setTimeout> | null = null

    const scheduleNextPoll = (intervalMs?: number) => {
      if (timerId != null) {
        window.clearTimeout(timerId)
      }
      const pollIntervalMs = intervalMs ?? (playback?.running ? POLL_FAST_MS : POLL_SLOW_MS)
      timerId = window.setTimeout(() => {
        void poll()
      }, pollIntervalMs)
    }

    const poll = async () => {
      if (!isActive) {
        return
      }
      if (isAuthError) {
        return
      }

      try {
        const playbackResponse = await getPlaybackStatus()
        if (!isActive) {
          return
        }
        setPlayback(playbackResponse.data)
        const nextInterval = playbackResponse.data.running ? POLL_FAST_MS : POLL_SLOW_MS
        scheduleNextPoll(nextInterval)
      } catch (fetchError) {
        if (!isActive) {
          return
        }
        const message = fetchError instanceof Error ? fetchError.message : '재생 상태 조회 실패'
        const isUnauthorized = message.includes('401') || /unauthor|forbidden/i.test(message)
        if (isUnauthorized) {
          setIsAuthError(true)
          setError('인증이 만료되어 타임라인 폴링을 중단했습니다. 다시 로그인해주세요.')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return
        }
        setError(message)
        scheduleNextPoll()
        return
      }

      try {
        const timelineResponse = await getDashboardTimeline(plantId, { range, futureHours })
        if (!isActive) {
          return
        }
        setTimeline((prev) => {
          if (prev?.lastUpdatedAt === timelineResponse.data.lastUpdatedAt) {
            return prev
          }
          return timelineResponse.data
        })
        setError('')
      } catch (fetchError) {
        if (!isActive) {
          return
        }
        const message = fetchError instanceof Error ? fetchError.message : '타임라인 조회 실패'
        const isUnauthorized = message.includes('401') || /unauthor|forbidden/i.test(message)
        if (isUnauthorized) {
          setIsAuthError(true)
          setError('인증이 만료되어 타임라인 폴링을 중단했습니다. 다시 로그인해주세요.')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return
        }
        setError(message)
      }
    }

    const handleSimulationChange = () => {
      void poll()
    }

    window.addEventListener(SIMULATION_CHANGE_EVENT, handleSimulationChange)
    void poll()

    return () => {
      isActive = false
      if (timerId != null) {
        window.clearTimeout(timerId)
      }
      window.removeEventListener(SIMULATION_CHANGE_EVENT, handleSimulationChange)
    }
  }, [futureHours, isAuthError, plantId, playback?.running, range, refreshKey])

  return {
    range,
    setRange,
    futureHours,
    setFutureHours,
    timeline,
    playback,
    isLoading,
    error,
    isAuthError,
    refresh,
    virtualNow: timeline?.virtualNow ?? playback?.virtualCurrentTime ?? null,
  }
}
