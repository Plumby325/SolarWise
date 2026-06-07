import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnomalyDetail, updateAnomalyStatus } from '@/api'
import type { AnomalyEvent, TimelineAnomalyMarker } from '@/api'
import { formatKoreanDateTime } from '@/shared/utils/dateFormat'
import styles from './TimelineAnomalyPanel.module.css'

type TimelineAnomalyPanelProps = {
  plantId: number
  marker: TimelineAnomalyMarker
  onClose: () => void
  onStatusUpdated: () => void
}

export function TimelineAnomalyPanel({ plantId, marker, onClose, onStatusUpdated }: TimelineAnomalyPanelProps) {
  const [event, setEvent] = useState<AnomalyEvent | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    let isActive = true
    setIsLoading(true)

    getAnomalyDetail(plantId, marker.eventId)
      .then((response) => {
        if (!isActive) {
          return
        }

        setEvent(response.data)
        setErrorMessage('')
      })
      .catch((error) => {
        if (!isActive) {
          return
        }

        setEvent(null)
        setErrorMessage(error instanceof Error ? error.message : '이상 상세 조회 실패')
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [marker.eventId, plantId])

  const handleStatusChange = (status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    if (!event) {
      return
    }

    setIsUpdating(true)

    updateAnomalyStatus(plantId, event.eventId, status)
      .then((response) => {
        setEvent((current) =>
          current
            ? {
                ...current,
                status: response.data.status,
              }
            : current,
        )
        onStatusUpdated()
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : '상태 변경 실패')
      })
      .finally(() => setIsUpdating(false))
  }

  const displayEvent = event ?? {
    eventId: marker.eventId,
    type: marker.type ?? 'POWER',
    severity: marker.severity,
    detectedAt: marker.detectedAt,
    summary: marker.summary,
    status: marker.status ?? 'OPEN',
    cause: null,
    recommendedAction: null,
    xaiExplanation: null,
  }

  const isAcknowledged = displayEvent.status === 'ACKNOWLEDGED'
  const isResolved = displayEvent.status === 'RESOLVED'

  return (
    <aside className={styles.panel} aria-label="이상 이벤트 상세">
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>{displayEvent.severity}</span>
          <span className={styles.type}>{displayEvent.type}</span>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
          ×
        </button>
      </header>

      {isLoading ? <p className={styles.meta}>상세 불러오는 중…</p> : null}
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <h3>{displayEvent.summary}</h3>
      <p className={styles.meta}>{formatKoreanDateTime(displayEvent.detectedAt)} · {displayEvent.status}</p>

      {displayEvent.cause ? <p className={styles.body}>{displayEvent.cause}</p> : null}
      {displayEvent.recommendedAction ? (
        <p className={styles.action}>
          <strong>권장 조치</strong>
          <br />
          {displayEvent.recommendedAction}
        </p>
      ) : null}
      {displayEvent.xaiExplanation ? <p className={styles.body}>{displayEvent.xaiExplanation}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          disabled={isUpdating || isAcknowledged || isResolved}
          onClick={() => handleStatusChange('ACKNOWLEDGED')}
        >
          확인 완료
        </button>
        <button
          type="button"
          className={styles.resolveButton}
          disabled={isUpdating || isResolved}
          onClick={() => handleStatusChange('RESOLVED')}
        >
          조치 완료
        </button>
        <Link to={`/anomaly-detection/detail?eventId=${displayEvent.eventId}`}>전체 상세 →</Link>
      </div>
    </aside>
  )
}
