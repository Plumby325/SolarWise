import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { getSessionUser } from '@/shared/utils/sessionUser'
import styles from './NotificationSettingsPage.module.css'

type Severity = 'LOW' | 'MEDIUM' | 'HIGH'
type AlertTypeId = 'power' | 'vision' | 'accuracy'

const severityOptions: Array<{ id: Severity; label: string; description: string }> = [
  { id: 'HIGH', label: 'HIGH', description: '심각 이벤트만' },
  { id: 'MEDIUM', label: 'MEDIUM', description: '중간 이상' },
  { id: 'LOW', label: 'LOW', description: '모든 이벤트' },
]

const severityToneClasses: Record<Severity, string> = {
  HIGH: 'severityHighOption',
  MEDIUM: 'severityMediumOption',
  LOW: 'severityLowOption',
}

const alertTypes: Array<{ id: AlertTypeId; label: string; tone: 'blue' | 'green' | 'amber' }> = [
  { id: 'power', label: '발전량 이상 감지 (POWER)', tone: 'blue' },
  { id: 'vision', label: '패널 비전 이상 감지 (VISION)', tone: 'green' },
  { id: 'accuracy', label: '예측 정확도 저하', tone: 'amber' },
]

type MailEvent = { status: 'SENT' | 'FAILED'; severity: string; title: string; email: string; time: string }

/** 데모/향후 API 연동용: 목록에는 SENT만 노출, 통계는 성공·실패 모두 반영 */
const mailEventsAll: readonly MailEvent[] = [
  { status: 'SENT', severity: 'HIGH', title: '예상 대비 발전량 28% 감소', email: 'alert@solarwise.com', time: '오늘 13:41' },
  { status: 'SENT', severity: 'MEDIUM', title: '패널 표면 오염 의심', email: 'alert@solarwise.com', time: '오늘 13:51' },
  { status: 'SENT', severity: 'HIGH', title: '패널 크랙 감지', email: 'alert@solarwise.com', time: '2일 전 09:11' },
  { status: 'FAILED', severity: 'MEDIUM', title: '인버터 연결 불안정', email: 'alert@solarwise.com', time: '3일 전 11:31' },
  { status: 'SENT', severity: 'LOW', title: '발전 효율 소폭 감소', email: 'alert@solarwise.com', time: '4일 전 16:22' },
] as const

function filterSentMailEvents(events: readonly MailEvent[]) {
  return events.filter((event) => event.status === 'SENT')
}

export function NotificationSettingsPage() {
  const navigate = useNavigate()
  const [isEmailEnabled, setIsEmailEnabled] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('MEDIUM')
  const [selectedTypes, setSelectedTypes] = useState<AlertTypeId[]>(['power', 'vision'])
  const [dedupeMinutes, setDedupeMinutes] = useState('30')
  const [email, setEmail] = useState(() => getSessionUser({ name: '사용자', email: 'alert@solarwise.com', role: 'OWNER' }).email)

  const mailHistorySentOnly = filterSentMailEvents(mailEventsAll)
  const mailAttemptTotal = mailEventsAll.length
  const mailSuccessCount = mailHistorySentOnly.length
  const mailFailedCount = mailAttemptTotal - mailSuccessCount

  const toggleAlertType = (typeId: AlertTypeId) => {
    setSelectedTypes((currentTypes) =>
      currentTypes.includes(typeId)
        ? currentTypes.filter((currentType) => currentType !== typeId)
        : [...currentTypes, typeId],
    )
  }

  return (
    <div className={styles.pageShell}>
      <DashboardSidebar activeSection="notifications" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>알림 설정</h1>
            <p>이상 감지 시 이메일 알림 설정을 관리하세요</p>
          </div>
          <button className={styles.saveButton} type="button">설정 저장 ✓</button>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.settingsCard} aria-labelledby="email-settings-title">
            <div className={styles.cardHeader}>
              <h2 id="email-settings-title">이메일 알림 설정</h2>
              <p>이상 이벤트 발생 시 알림 수신 설정</p>
            </div>

            <div className={styles.togglePanel}>
              <div>
                <strong>이메일 알림 수신</strong>
                <span>이상 이벤트 감지 시 설정한 이메일로 알림을 발송합니다</span>
              </div>
              <button
                className={[styles.switchButton, isEmailEnabled ? styles.switchOn : ''].filter(Boolean).join(' ')}
                type="button"
                aria-pressed={isEmailEnabled}
                onClick={() => setIsEmailEnabled((enabled) => !enabled)}
              >
                <span>{isEmailEnabled ? 'ON' : 'OFF'}</span>
                <i aria-hidden="true" />
              </button>
            </div>

            <label className={styles.fieldLabel} htmlFor="notification-email">수신 이메일 주소</label>
            <div className={styles.emailField}>
              <input id="notification-email" value={email} onChange={(event) => setEmail(event.target.value)} />
              <span aria-hidden="true">✎</span>
            </div>

            <div className={styles.sectionTitle}>
              <strong>알림 심각도 임계치</strong>
              <span>선택한 수준 이상의 이벤트 발생 시에만 알림을 발송합니다</span>
            </div>

            <div className={styles.severityGrid} aria-label="알림 심각도 임계치">
              {severityOptions.map((option) => {
                const isSelected = option.id === selectedSeverity
                return (
                  <button
                    key={option.id}
                    className={[
                      styles.severityOption,
                      styles[severityToneClasses[option.id]],
                      isSelected ? styles.severitySelected : '',
                    ].filter(Boolean).join(' ')}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSeverity(option.id)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                    {isSelected ? <i aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>

            <div className={styles.sectionTitle}>
              <strong>알림 유형 선택</strong>
            </div>

            <div className={styles.typeList}>
              {alertTypes.map((type) => {
                const isChecked = selectedTypes.includes(type.id)
                return (
                  <label key={type.id} className={[styles.typeItem, !isChecked ? styles.typeItemMuted : ''].filter(Boolean).join(' ')}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAlertType(type.id)}
                    />
                    <span className={[styles.checkboxVisual, isChecked ? styles[type.tone] : ''].filter(Boolean).join(' ')} aria-hidden="true">
                      {isChecked ? '✓' : ''}
                    </span>
                    <strong>{type.label}</strong>
                  </label>
                )
              })}
            </div>

            <div className={styles.dedupePanel}>
              <div>
                <strong>중복 알림 방지</strong>
                <span>동일 이벤트로 인한 중복 알림 발송을 방지합니다</span>
              </div>
              <select value={dedupeMinutes} onChange={(event) => setDedupeMinutes(event.target.value)} aria-label="중복 알림 방지 시간">
                <option value="10">10분</option>
                <option value="30">30분</option>
                <option value="60">60분</option>
              </select>
            </div>
          </section>

          <section className={styles.historyCard} aria-labelledby="mail-history-title">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="mail-history-title">메일 발송 이력</h2>
                <p>최근 발송된 알림 이력</p>
              </div>
              <button type="button" onClick={() => navigate('/settings/notifications/history')}>
                전체 보기 →
              </button>
            </div>

            <div className={styles.historyList}>
              {mailHistorySentOnly.map((history) => (
                <article
                  key={`${history.title}-${history.time}`}
                  className={styles.historyItem}
                >
                  <div className={styles.historyBadges}>
                    <span className={styles.sentBadge}>{history.status}</span>
                    <span className={styles[`severity${history.severity}`]}>{history.severity}</span>
                  </div>
                  <strong>{history.title}</strong>
                  <small>✉ {history.email}</small>
                  <time>{history.time}</time>
                </article>
              ))}
            </div>

            <div className={styles.monthStats}>
              <strong>이번 달 발송 통계</strong>
              <div>
                <span>
                  <b>{mailAttemptTotal}</b>
                  발송 시도
                </span>
                <span>
                  <b>{mailSuccessCount}</b>
                  성공
                </span>
                <span>
                  <b className={styles.failedCount}>{mailFailedCount}</b>
                  실패
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
