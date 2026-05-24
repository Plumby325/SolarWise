import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import styles from './NotificationMailHistoryPage.module.css'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'
type AlertType = 'POWER' | 'VISION'
type MailStatus = 'SENT' | 'FAILED'

type MailHistoryItem = {
  id: string
  type: AlertType
  severity: Severity
  title: string
  plant: string
  email: string
  time: string
  month: string
  status: MailStatus
}

const allMailHistory: MailHistoryItem[] = [
  {
    id: 'A-0012',
    type: 'POWER',
    severity: 'HIGH',
    title: '예상 대비 발전량 28% 감소',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.05 13:41',
    month: '2026.04',
    status: 'SENT',
  },
  {
    id: 'A-0011',
    type: 'VISION',
    severity: 'MEDIUM',
    title: '패널 표면 오염 의심 — 영암 3구역',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.05 13:51',
    month: '2026.04',
    status: 'SENT',
  },
  {
    id: 'A-0010',
    type: 'POWER',
    severity: 'HIGH',
    title: '인버터 연결 오류 감지',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.04 09:22',
    month: '2026.04',
    status: 'SENT',
  },
  {
    id: 'A-0009',
    type: 'POWER',
    severity: 'MEDIUM',
    title: '발전 효율 15% 저하',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.03 14:10',
    month: '2026.04',
    status: 'FAILED',
  },
  {
    id: 'A-0008',
    type: 'VISION',
    severity: 'LOW',
    title: '패널 먼지 축적 주의',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.02 11:05',
    month: '2026.04',
    status: 'SENT',
  },
  {
    id: 'A-0007',
    type: 'POWER',
    severity: 'HIGH',
    title: '일사량 대비 출력 급감',
    plant: '전북 익산 1호 발전소',
    email: 'alert@solarwise.com',
    time: '2026.04.01 15:33',
    month: '2026.04',
    status: 'SENT',
  },
]

type FilterType = 'ALL' | 'SENT' | 'FAILED'

export function NotificationMailHistoryPage() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterType>('ALL')
  const [selectedMonth, setSelectedMonth] = useState('2026.04')

  const filteredHistory = useMemo(() => {
    return allMailHistory.filter((item) => {
      if (item.month !== selectedMonth) {
        return false
      }

      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false
      }

      if (!searchKeyword.trim()) {
        return true
      }

      const keyword = searchKeyword.trim().toLowerCase()
      return (
        item.title.toLowerCase().includes(keyword) ||
        item.plant.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword)
      )
    })
  }, [searchKeyword, selectedMonth, statusFilter])

  const sentCount = filteredHistory.filter((item) => item.status === 'SENT').length

  return (
    <div className={styles.pageShell}>
      <DashboardSidebar activeSection="notifications" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <Link to="/settings/notifications" className={styles.backButton}>
              ← 알림 설정
            </Link>
            <h1>메일 발송 이력</h1>
          </div>

          <div className={styles.headerActions}>
            <span className={styles.monthBadge}>이번 달 발송 {sentCount}건</span>
            <button type="button" className={styles.csvButton}>
              ↓ CSV 내보내기
            </button>
          </div>
        </header>

        <section className={styles.filterBar} aria-label="메일 발송 이력 필터">
          <label className={styles.searchField}>
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="발전소명, 이벤트 검색..."
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </label>

          <div className={styles.filterButtons}>
            <button
              type="button"
              className={[styles.filterButton, statusFilter === 'ALL' ? styles.filterButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => setStatusFilter('ALL')}
            >
              전체
            </button>
            <button
              type="button"
              className={[styles.filterButton, statusFilter === 'SENT' ? styles.filterButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => setStatusFilter('SENT')}
            >
              발송 완료
            </button>
            <button
              type="button"
              className={[styles.filterButton, statusFilter === 'FAILED' ? styles.filterButtonActive : ''].filter(Boolean).join(' ')}
              onClick={() => setStatusFilter('FAILED')}
            >
              발송 실패
            </button>
          </div>

          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className={styles.monthSelect}>
            <option value="2026.04">2026.04</option>
          </select>
        </section>

        <section className={styles.listSection} aria-label="메일 발송 이력 목록">
          {filteredHistory.map((item) => (
            <article key={item.id} className={[styles.itemCard, styles[`severity${item.severity}`]].join(' ')}>
              <div className={styles.itemMetaTop}>
                <div className={styles.itemTags}>
                  <span className={styles.itemId}>#{item.id}</span>
                  <span className={[styles.tag, styles[`tag${item.type}`]].join(' ')}>{item.type}</span>
                  <span className={[styles.tag, styles[`tag${item.severity}`]].join(' ')}>{item.severity}</span>
                </div>
                <time>{item.time}</time>
              </div>

              <strong>{item.title}</strong>

              <div className={styles.itemMetaBottom}>
                <span>◉ {item.plant}</span>
                <span>·</span>
                <span>{item.email}</span>
              </div>

              <div className={styles.itemActions}>
                <span className={[styles.statusBadge, item.status === 'SENT' ? styles.statusSent : styles.statusFailed].join(' ')}>
                  {item.status === 'SENT' ? '✓ 발송 완료' : '✕ 발송 실패'}
                </span>
                <button type="button" className={styles.detailButton}>
                  상세 →
                </button>
              </div>
            </article>
          ))}
        </section>

        <p className={styles.listFooter}>
          총 {filteredHistory.length}건 표시 중 (이번 달 {sentCount}건)
        </p>
      </main>
    </div>
  )
}

