import { useCallback, useEffect, useState } from 'react'
import { getDashboardTimeline, getPlaybackStatus } from '@/api'
import type { DashboardTimelineResponse, SimulationPlaybackStatus, TimelineRange } from '@/api'

const POLL_FAST_MS = 1000
const POLL_SLOW_MS = 5000

export function useDashboardTimeline(plantId: number | null, refreshKey = 0) {
  const [range, setRange] = useState<TimelineRange>('DAY')
  const [timeline, setTimeline] = useState<DashboardTimelineResponse | null>(null)
  const [playback, setPlayback] = useState<SimulationPlaybackStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!plantId) {
      setTimeline(null)
      setPlayback(null)
      setError('발전소 데이터 없음')
      return
    }

    setIsLoading(true)

    try {
      const [timelineResponse, playbackResponse] = await Promise.all([
        getDashboardTimeline(plantId, { range }),
        getPlaybackStatus(),
      ])
      setTimeline(timelineResponse.data)
      setPlayback(playbackResponse.data)
      setError('')
    } catch (fetchError) {
      setTimeline(null)
      setError(fetchError instanceof Error ? fetchError.message : '타임라인 조회 실패')
    } finally {
      setIsLoading(false)
    }
  }, [plantId, range])

  useEffect(() => {
    if (!plantId) {
      setTimeline(null)
      setPlayback(null)
      setError('발전소 데이터 없음')
      return undefined
    }

    let isActive = true
    let timerId = 0
    let pollIntervalMs = POLL_SLOW_MS

    const scheduleNextPoll = () => {
      window.clearInterval(timerId)
      timerId = window.setInterval(() => {
        void poll()
      }, pollIntervalMs)
    }

    const poll = async () => {
      if (!isActive) {
        return
      }

      let playbackResponse: Awaited<ReturnType<typeof getPlaybackStatus>> | null = null

      try {
        playbackResponse = await getPlaybackStatus()
        if (!isActive) {
          return
        }
        setPlayback(playbackResponse.data)
        pollIntervalMs = playbackResponse.data.running ? POLL_FAST_MS : POLL_SLOW_MS
      } catch (fetchError) {
        if (!isActive) {
          return
        }
        setPlayback(null)
        pollIntervalMs = POLL_SLOW_MS
        setError(fetchError instanceof Error ? fetchError.message : '재생 상태 조회 실패')
        scheduleNextPoll()
        return
      }

      try {
        const timelineResponse = await getDashboardTimeline(plantId, { range })
        if (!isActive) {
          return
        }
        setTimeline(timelineResponse.data)
        setError('')
      } catch (fetchError) {
        if (!isActive) {
          return
        }
        setError(fetchError instanceof Error ? fetchError.message : '타임라인 조회 실패')
      }

      scheduleNextPoll()
    }

    void poll()

    return () => {
      isActive = false
      window.clearInterval(timerId)
    }
  }, [plantId, range, refreshKey])

  return {
    range,
    setRange,
    timeline,
    playback,
    isLoading,
    error,
    refresh,
    virtualNow: timeline?.virtualNow ?? playback?.virtualCurrentTime ?? null,
  }
}
