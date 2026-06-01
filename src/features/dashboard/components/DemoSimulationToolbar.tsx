import { useState } from 'react'
import { startPlayback, stopPlayback, triggerPowerAnomaly } from '@/api'
import { notifySimulationChange } from '@/shared/layout/DashboardSidebar'
import { getSessionUser } from '@/shared/utils/sessionUser'
import styles from './DemoSimulationToolbar.module.css'

type DemoSimulationToolbarProps = {
  plantId: number | null
  isRunning: boolean
  onPlaybackChange: () => void
  onTriggerComplete: () => void
}

export function DemoSimulationToolbar({
  plantId,
  isRunning,
  onPlaybackChange,
  onTriggerComplete,
}: DemoSimulationToolbarProps) {
  const user = getSessionUser()
  const [actionError, setActionError] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  if (user.role !== 'ADMIN') {
    return null
  }

  const runAction = async (action: () => Promise<unknown>) => {
    setIsBusy(true)
    setActionError('')

    try {
      await action()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '시연 API 호출 실패')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className={styles.toolbar} aria-label="시연 시뮬레이션 제어">
      <span className={styles.label}>시연 제어 (ADMIN)</span>
      <button
        type="button"
        disabled={isBusy || isRunning || !plantId}
        onClick={() =>
          void runAction(async () => {
            await startPlayback()
            onPlaybackChange()
            notifySimulationChange()
          })
        }
      >
        재생 시작
      </button>
      <button
        type="button"
        disabled={isBusy || !isRunning}
        onClick={() =>
          void runAction(async () => {
            await stopPlayback()
            onPlaybackChange()
            notifySimulationChange()
          })
        }
      >
        재생 정지
      </button>
      <button
        type="button"
        disabled={isBusy || !plantId}
        onClick={() =>
          void runAction(async () => {
            if (!plantId) {
              return
            }

            await triggerPowerAnomaly({
              plantId,
              anomalySeverity: 'HIGH',
              differencePercentage: 40,
              durationHours: 2,
              description: '시연용 미래 구간 발전량 저하',
            })
            onTriggerComplete()
            notifySimulationChange()
          })
        }
      >
        POWER 이상 트리거
      </button>
      {actionError ? <p className={styles.error}>{actionError}</p> : null}
    </div>
  )
}
