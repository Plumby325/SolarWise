import styles from './DashboardPage.module.css'

const summaryCards = ['발전량', '효율', '수익', '알림'] as const

export function DashboardPage() {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar} aria-label="대시보드 사이드바">
        <p className={styles.sidebarGuide}>Sidebar (240px)</p>

        <section className={styles.logoArea} aria-label="로고 영역">
          <span>Logo Area</span>
        </section>

        <section className={styles.plantSelector} aria-label="발전소 선택">
          <span>Plant Selector</span>
        </section>

        <nav className={styles.navMenu} aria-label="대시보드 메뉴">
          <span>Nav Menu</span>
        </nav>

        <section className={styles.sidebarBottom} aria-label="하단 영역">
          <span>Bottom</span>
        </section>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.headerBar}>
          <p>Header (발전소 이름 + 날짜 + 알림)</p>
        </header>

        <div className={styles.content}>
          <section className={[styles.panel, styles.summaryPanel].join(' ')} aria-label="요약 카드">
            <p>S1 — 요약 카드 4개</p>
            <div className={styles.summaryGrid} aria-hidden="true">
              {summaryCards.map((card) => (
                <div key={card}>{card}</div>
              ))}
            </div>
          </section>

          <section className={[styles.panel, styles.chartPanel].join(' ')} aria-label="실시간 발전량 차트">
            <p>S2 — 실시간 발전량 차트</p>
          </section>

          <section className={[styles.panel, styles.forecastPanel].join(' ')} aria-label="AI 발전량 예측">
            <p>S3 — AI 발전량 예측</p>
          </section>

          <section className={[styles.panel, styles.detectionPanel].join(' ')} aria-label="패널 이상 감지">
            <p>S4 — 패널 이상 감지</p>
          </section>
        </div>
      </main>
    </div>
  )
}
