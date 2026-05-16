import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAnomalyDetail, updateAnomalyStatus } from '@/api'
import type { AnomalyEvent } from '@/api'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { BackNavLink } from '@/shared/ui/BackNavLink'
import { formatKoreanDateTime, formatKoreanTime } from '@/shared/utils/dateFormat'
import { getFallbackText } from '@/shared/utils/text'
import styles from './AnomalyDetailPage.module.css'

const quickQuestions = [
  '패널 청소 주기는 언제인가요?',
  '비슷한 이상이 이전에도 있었나요?',
  '언제 해결될까요?',
] as const

function getRecommendedActions(value: string | null | undefined) {
  const text = getFallbackText(value, '담당자가 이벤트를 확인한 뒤 현장 점검 및 조치 내용을 등록하세요.')
  return text
    .split(/\r?\n|[.;]/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getSeverityTone(severity: string | undefined) {
  if (severity === 'LOW') {
    return 'blue'
  }

  if (severity === 'MEDIUM') {
    return 'amber'
  }

  return 'red'
}

export function AnomalyDetailPage() {
  const [searchParams] = useSearchParams()
  const eventId = Number(searchParams.get('eventId'))
  const { defaultPlantId, isLoading: isPlantLoading, errorMessage: plantErrorMessage } = useDefaultPlant()
  const [event, setEvent] = useState<AnomalyEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const hasValidEventId = Number.isFinite(eventId) && eventId > 0

  const historyItems = useMemo(() => {
    if (!event) {
      return []
    }

    const items = [
      { time: formatKoreanTime(event.detectedAt), title: '이상 감지', detail: event.summary, tone: 'red' },
    ]

    if (event.status === 'ACKNOWLEDGED' || event.status === 'RESOLVED') {
      items.push({ time: '현재', title: '확인 완료', detail: '담당자가 이상 이벤트를 확인했습니다.', tone: 'green' })
    }

    if (event.status === 'RESOLVED') {
      items.push({ time: '현재', title: '해결 완료', detail: '이상 이벤트가 해결 상태로 변경되었습니다.', tone: 'green' })
    }

    return items
  }, [event])

  const aiMessages = useMemo(() => {
    if (!event) {
      return []
    }

    return [
      {
        type: 'ai',
        lines: [
          `이상 이벤트 #${event.eventId}의 내용을 요약해드릴게요.`,
          getFallbackText(event.cause, '아직 등록된 원인 분석 내용이 없습니다.'),
        ],
      },
      {
        type: 'reference',
        lines: [`참조: ${event.type} 유형 · ${event.severity} 심각도 · ${event.status} 상태`],
      },
      {
        type: 'ai',
        lines: [
          getFallbackText(event.xaiExplanation, '아직 등록된 XAI 판단 근거가 없습니다.'),
          getFallbackText(event.recommendedAction, '권장 조치는 담당자 확인 후 등록하세요.'),
        ],
      },
    ] as const
  }, [event])

  useEffect(() => {
    if (isPlantLoading) {
      return
    }

    if (!defaultPlantId || !hasValidEventId) {
      if (!hasValidEventId) {
        setErrorMessage('상세 조회할 이벤트 ID가 없습니다.')
      } else {
        setErrorMessage(plantErrorMessage || '조회 가능한 발전소가 없습니다.')
      }
      setIsLoading(false)
      return
    }

    let isActive = true

    const fetchEvent = () => {
      getAnomalyDetail(defaultPlantId, eventId)
        .then((response) => {
          if (!isActive) {
            return
          }

          setEvent(response.data)
          setErrorMessage('')
          setIsLoading(false)
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          setErrorMessage(error instanceof Error ? error.message : '이상 이벤트 상세를 불러오지 못했습니다.')
          setIsLoading(false)
        })
    }

    fetchEvent()
    const pollingTimer = window.setInterval(fetchEvent, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [defaultPlantId, eventId, hasValidEventId, isPlantLoading, plantErrorMessage])

  const handleStatusChange = (status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    if (!defaultPlantId || !event) {
      return
    }

    setIsUpdating(true)
    setErrorMessage('')

    updateAnomalyStatus(defaultPlantId, event.eventId, status)
      .then(() => getAnomalyDetail(defaultPlantId, eventId))
      .then((refresh) => {
        setEvent(refresh.data)
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : '이벤트 상태 변경에 실패했습니다.')
      })
      .finally(() => {
        setIsUpdating(false)
      })
  }

  const recommendedActions = getRecommendedActions(event?.recommendedAction)
  const isAcknowledged = event?.status === 'ACKNOWLEDGED'
  const isResolved = event?.status === 'RESOLVED'
  const severityTone = getSeverityTone(event?.severity)

  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="anomaly" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <BackNavLink to="/anomaly-detection">← 목록</BackNavLink>
            <h1>이상 이벤트 상세</h1>
            <span className={[styles.highBadge, styles[severityTone]].join(' ')}><i />{event?.severity ?? '-'}</span>
            <span className={styles.openBadge}>{event?.status ?? '-'}</span>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => handleStatusChange('ACKNOWLEDGED')}
              disabled={!event || isUpdating || isAcknowledged || isResolved}
            >
              {isAcknowledged || isResolved ? '✓ 확인 완료' : '✓ 확인 완료'}
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={!event || isUpdating || isResolved}
            >
              ✓ 해결 완료
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.detailCard} aria-labelledby="event-info-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="event-info-title">이벤트 정보</h2>
                <p>
                  {event ? `${formatKoreanDateTime(event.detectedAt)} · ${event.type} 유형` : '이벤트 정보를 불러오는 중입니다.'}
                </p>
              </div>
            </div>

            <article className={styles.eventSummary}>
              <h3>{event?.summary ?? (isLoading ? '이벤트 상세를 불러오는 중입니다.' : '이벤트를 찾을 수 없습니다.')}</h3>
              <p>{errorMessage || (event ? `${event.severity} · ${event.status}` : '상세 조회할 이벤트를 선택해 주세요.')}</p>
            </article>

            <section className={styles.sectionBlock} aria-labelledby="measurement-title">
              <h3 id="measurement-title">이벤트 메타 정보</h3>
              <div className={styles.measurementBox}>
                <div>
                  <span>이벤트 유형</span>
                  <strong className={styles.blue}>{event?.type ?? '-'}</strong>
                </div>
                <div>
                  <span>심각도</span>
                  <strong className={styles[severityTone]}>{event?.severity ?? '-'}</strong>
                </div>
                <b>{event?.status ?? '-'}</b>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="cause-title">
              <h3 id="cause-title">원인 분석</h3>
              <div className={[styles.insightBox, styles.causeBox].join(' ')}>
                {getFallbackText(event?.cause, '아직 등록된 원인 분석 내용이 없습니다.')}
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="xai-title">
              <h3 id="xai-title">XAI 판단 근거</h3>
              <div className={[styles.insightBox, styles.xaiBox].join(' ')}>
                <p>{getFallbackText(event?.xaiExplanation, '아직 등록된 XAI 판단 근거가 없습니다.')}</p>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="action-title">
              <h3 id="action-title">권장 조치</h3>
              <div className={[styles.insightBox, styles.actionBox].join(' ')}>
                <ol>
                  {recommendedActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby="history-title">
              <h3 id="history-title">처리 이력</h3>
              <div className={styles.historyList}>
                {historyItems.map((item) => (
                  <article key={`${item.time}-${item.title}`} className={[styles.historyItem, styles[item.tone]].join(' ')}>
                    <span aria-hidden="true" />
                    <time>{item.time}</time>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className={styles.chatPanel} aria-labelledby="ai-chat-title">
            <header className={styles.chatHeader}>
              <span className={styles.aiAvatar}>AI</span>
              <div>
                <h2 id="ai-chat-title">AI 원인 설명 챗</h2>
                <p>{event ? `이상 이벤트 #${event.eventId} · XAI 기반 분석` : '이벤트 선택 필요'}</p>
              </div>
              <span className={[styles.chatSeverity, styles[severityTone]].join(' ')}><i />{event?.severity ?? '-'}</span>
            </header>

            <div className={styles.chatBody}>
              {aiMessages.map((message, index) => (
                <article key={`${message.type}-${index}`} className={styles[`${message.type}Message`]}>
                  {message.type === 'ai' ? <span className={styles.messageAvatar}>AI</span> : null}
                  <div>
                    {message.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </article>
              ))}

              <div className={styles.quickArea}>
                <h3>💬 빠른 질문</h3>
                {quickQuestions.map((question) => (
                  <button key={question} type="button">→ {question}</button>
                ))}
              </div>

              <div className={styles.relatedArea}>
                <h3>관련 데이터</h3>
                <div className={styles.relatedGrid}>
                  <article className={styles.powerCard}>
                    <span>이벤트 유형</span>
                    <strong>{event?.type ?? '-'}</strong>
                    <small>{event ? `#${event.eventId}` : '-'}</small>
                  </article>
                  <article className={styles.solarCard}>
                    <span>처리 상태</span>
                    <strong>{event?.status ?? '-'}</strong>
                    <small>{event?.severity ?? '-'}</small>
                  </article>
                </div>
              </div>
            </div>

            <form className={styles.chatInput}>
              <label htmlFor="anomaly-question">이상 원인 질문</label>
              <input id="anomaly-question" placeholder="이상 원인에 대해 질문하세요..." />
              <button type="submit" aria-label="질문 전송">↑</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
