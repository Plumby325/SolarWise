import { Link } from 'react-router-dom'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import styles from './AnomalyDetectionMainPage.module.css'

const summaryCards = [
  { label: '전체', value: '12', tone: 'dark' },
  { label: 'OPEN', value: '5', tone: 'red' },
  { label: 'HIGH', value: '2', tone: 'redSoft' },
  { label: 'MEDIUM', value: '3', tone: 'amber' },
] as const

const events = [
  {
    severity: 'HIGH',
    type: 'POWER',
    title: '예상 대비 발전량 28% 감소',
    time: '오늘 13:40',
    status: 'OPEN',
    tone: 'red',
    selected: true,
  },
  {
    severity: 'MEDIUM',
    type: 'VISION',
    title: '패널 표면 오염 의심',
    time: '오늘 13:50',
    status: 'OPEN',
    tone: 'amber',
    selected: false,
  },
  {
    severity: 'LOW',
    type: 'POWER',
    title: '발전 효율 5% 소폭 감소',
    time: '어제 16:20',
    status: 'ACKNOWLEDGED',
    tone: 'blue',
    selected: false,
  },
  {
    severity: 'HIGH',
    type: 'VISION',
    title: '패널 크랙 감지 (영암 3구역)',
    time: '2일 전 09:10',
    status: 'RESOLVED',
    tone: 'muted',
    selected: false,
  },
  {
    severity: 'MEDIUM',
    type: 'POWER',
    title: '인버터 연결 불안정',
    time: '3일 전 11:30',
    status: 'RESOLVED',
    tone: 'muted',
    selected: false,
  },
] as const

const evidenceMetrics = [
  { label: '출력 저하율', value: '70%', size: '70%', tone: 'red' },
  { label: '일사량 편차', value: '45%', size: '45%', tone: 'amber' },
  { label: '패널 표면 상태', value: '28%', size: '28%', tone: 'blue' },
] as const

export function AnomalyDetectionMainPage() {
  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="anomaly" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>이상 감지</h1>
            <p>발전량 이상 및 패널 이상 이벤트</p>
          </div>

          <div className={styles.filters} aria-label="이벤트 필터">
            <button type="button">
              <span>유형</span>
              전체 ▾
            </button>
            <button type="button">
              <span>심각도</span>
              전체 ▾
            </button>
            <button className={styles.openFilter} type="button">
              <span>상태</span>
              OPEN ▾
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.summaryGrid} aria-label="이상 감지 요약">
            {summaryCards.map((card) => (
              <article key={card.label} className={[styles.summaryCard, styles[card.tone]].join(' ')}>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </article>
            ))}
          </section>

          <section className={styles.eventList} aria-labelledby="event-list-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="event-list-title">이벤트 목록</h2>
                <p>최신순</p>
              </div>
              <button type="button">최신순 ▾</button>
            </div>

            <div className={styles.events}>
              {events.map((event) => (
                <article key={`${event.title}-${event.time}`} className={[styles.eventItem, styles[event.tone], event.selected ? styles.eventSelected : ''].filter(Boolean).join(' ')}>
                  <div className={styles.eventTags}>
                    <span>{event.severity}</span>
                    <small>{event.type}</small>
                  </div>
                  <h3>{event.title}</h3>
                  <time>{event.time}</time>
                  <b className={styles[`status${event.status}`]}>{event.status}</b>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.detailPanel} aria-labelledby="event-detail-title">
            <div className={styles.detailHero}>
              <div className={styles.eventTags}>
                <span>HIGH</span>
                <small>POWER</small>
              </div>
              <time>오늘 13:40</time>
              <strong>OPEN</strong>
              <h2 id="event-detail-title">예상 대비 발전량 28% 감소</h2>
            </div>

            <div className={styles.detailBody}>
              <h3>원인 분석</h3>
              <div className={[styles.insightBox, styles.causeBox].join(' ')}>
                일사량 대비 실제 출력이 낮아 패널 오염 또는 음영 가능성이 높습니다.
              </div>

              <h3>XAI 판단 근거</h3>
              <div className={[styles.insightBox, styles.xaiBox].join(' ')}>
                <p>일사량은 정상 범위였지만 출력만 급감해 설비 이상 가능성이 높습니다.</p>
                <div className={styles.metricList}>
                  {evidenceMetrics.map((metric) => (
                    <div key={metric.label} className={styles.metricRow}>
                      <span>{metric.label}</span>
                      <div>
                        <i className={styles[metric.tone]} style={{ width: metric.size }} />
                      </div>
                      <b className={styles[metric.tone]}>{metric.value}</b>
                    </div>
                  ))}
                </div>
              </div>

              <h3>권장 조치</h3>
              <div className={[styles.insightBox, styles.actionBox].join(' ')}>
                패널 표면 오염 여부와 주변 음영 발생 요소를 우선 점검하세요.
              </div>

              <div className={styles.detailActions}>
                <button type="button">✓ 확인 완료 처리</button>
                <Link to="/anomaly-detection/detail">상세 보기 →</Link>
              </div>

              <p className={styles.aiNote}>💬 AI 원인 설명 챗 포함 — 상세 화면에서 AI에게 직접 질문하세요</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
