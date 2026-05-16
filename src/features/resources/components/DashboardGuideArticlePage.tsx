import { Link } from 'react-router-dom'
import { SiteFooter } from '@/shared/layout/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './DashboardGuideArticlePage.module.css'

const outlineItems = [
  { href: '#step-1', label: '실시간 차트' },
  { href: '#step-2', label: '이상 감지' },
  { href: '#step-3', label: 'AI 예측 읽기' },
] as const

export function DashboardGuideArticlePage() {
  return (
    <div className={styles.page}>
      <SiteHeader active="resources" ariaLabel="리소스 가이드 메뉴" />

      <main>
        <header className={styles.articleHeader}>
          <div className={[styles.container, styles.articleHeaderInner].join(' ')}>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <Link to="/resources" className={styles.breadcrumbLink}>
                리소스 홈
              </Link>
              <span className={styles.breadcrumbSep} aria-hidden="true">
                ›
              </span>
              <span className={styles.breadcrumbCurrent}>리소스 상세</span>
            </nav>

            <div className={styles.guideBadge}>◈ 핵심 기능</div>

            <h1 className={styles.articleTitle}>
              <span>대시보드</span>
              <span>100% 활용하기</span>
            </h1>

            <div className={styles.articleMeta}>
              <span>읽기 시간: 8분</span>
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
              <span>2026.04.10</span>
            </div>

            <div className={styles.headerDivider} aria-hidden="true" />

            <div className={styles.outline}>
              <strong className={styles.outlineLabel}>이 글에서</strong>
              <div className={styles.outlineLinks}>
                {outlineItems.map((item) => (
                  <a key={item.href} className={styles.outlineLink} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>

        <article className={styles.articleBody}>
          <div className={[styles.container, styles.articleColumn].join(' ')}>
            <section id="step-1" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNum}>1</span>
                <h2 className={styles.sectionTitle}>실시간 발전량 차트 읽기</h2>
              </div>
              <p className={styles.sectionLead}>
                대시보드 상단에 위치한 실시간 차트는 현재 발전량을 kW 단위로 보여줍니다. 5분·1시간·1일 단위로 전환해서 볼 수 있어요.
              </p>

              <div className={styles.stepList}>
                <div className={styles.stepListRail} aria-hidden="true" />
                <ul className={styles.stepListInner}>
                  <li className={styles.stepListItem}>
                    <span className={styles.intervalBadge}>5m</span>
                    <span>5분 단위 — 지금 이 순간 발전 상황을 세밀하게</span>
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.intervalBadge}>1h</span>
                    <span>1시간 단위 — 오늘 하루 발전 흐름 파악</span>
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.intervalBadge}>1d</span>
                    <span>1일 단위 — 주간/월간 추이 확인</span>
                  </li>
                </ul>
              </div>

              <div className={`${styles.callout} ${styles.calloutGreen}`}>
                <span className={styles.calloutIcon} aria-hidden="true">
                  ◆
                </span>
                <p>Live 배지가 초록으로 켜져 있으면 실시간으로 데이터가 업데이트 중이에요.</p>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section id="step-2" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNum}>2</span>
                <h2 className={styles.sectionTitle}>이상 감지 카드 확인하기</h2>
              </div>
              <p className={styles.sectionLead}>
                대시보드 우측 하단의 이상 감지 카드에는 최근 감지된 이상 이벤트가 표시돼요. HIGH 심각도 이벤트는 즉시 대응이 필요해요.
              </p>

              <div className={styles.severityGrid}>
                <div className={`${styles.severityCard} ${styles.severityHigh}`}>
                  <div className={styles.severityAccent} />
                  <strong className={styles.severityLabel}>HIGH</strong>
                  <p className={styles.severityDesc}>즉시 대응 필요 — 패널 점검 권장</p>
                </div>
                <div className={`${styles.severityCard} ${styles.severityMedium}`}>
                  <div className={`${styles.severityAccent} ${styles.severityAccentOrange}`} />
                  <strong className={styles.severityLabelOrange}>MEDIUM</strong>
                  <p className={styles.severityDesc}>주의 필요 — 추이 모니터링</p>
                </div>
                <div className={`${styles.severityCard} ${styles.severityLow}`}>
                  <div className={`${styles.severityAccent} ${styles.severityAccentBlue}`} />
                  <strong className={styles.severityLabelBlue}>LOW</strong>
                  <p className={styles.severityDesc}>참고 — 정기 점검 시 확인</p>
                </div>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section id="step-3" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNum}>3</span>
                <h2 className={styles.sectionTitle}>AI 예측 그래프 해석하기</h2>
              </div>
              <p className={styles.sectionLead}>
                AI 발전량 예측 카드는 XGBoost 모델이 향후 2~3일의 발전량을 예측해 보여줘요. 초록선(실측)과 파란선(예측)을 비교해보세요.
              </p>

              <div className={styles.legendBox}>
                <div className={styles.legendRow}>
                  <span className={`${styles.legendDot} ${styles.legendDotGreen}`} aria-hidden="true" />
                  <strong className={styles.legendTerm}>초록 실선</strong>
                  <span className={styles.legendDesc}>: 오늘 실제 발전량 (실측값)</span>
                </div>
                <div className={styles.legendRow}>
                  <span className={`${styles.legendDot} ${styles.legendDotBlue}`} aria-hidden="true" />
                  <strong className={styles.legendTerm}>파란 점선</strong>
                  <span className={styles.legendDesc}>: AI가 예측한 발전량 (예측값)</span>
                </div>
                <div className={styles.legendRow}>
                  <span className={`${styles.legendDot} ${styles.legendDotBlueSoft}`} aria-hidden="true" />
                  <strong className={styles.legendTerm}>파란 영역</strong>
                  <span className={styles.legendDesc}>: 예측 신뢰 구간 (±8kW)</span>
                </div>
              </div>

              <div className={`${styles.callout} ${styles.calloutBlue}`}>
                <span className={styles.calloutIcon} aria-hidden="true">
                  ◆
                </span>
                <div className={styles.calloutStack}>
                  <p>SHAP 기여도 바는 어떤 요인이 발전량 예측에 가장 큰 영향을 주었는지 보여줍니다.</p>
                  <p>바가 길수록 영향이 크고, 파란색은 긍정적, 빨간색은 부정적 영향이에요.</p>
                </div>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section className={styles.nextSection} aria-labelledby="next-read">
              <h2 id="next-read" className={styles.nextHeading}>
                다음으로 읽어보세요
              </h2>
              <div className={styles.nextGrid}>
                <Link to="/services" className={`${styles.nextCard} ${styles.nextCardOrange}`}>
                  <div className={styles.nextCardAccentOrange} aria-hidden="true" />
                  <div className={styles.nextCardBody}>
                    <div className={styles.nextCardTop}>
                      <span className={styles.nextIconOrange} aria-hidden="true">
                        ★
                      </span>
                      <span className={styles.nextCardTitle}>AI가 뭘 설명하는 건가요?</span>
                      <span className={styles.nextArrowOrange} aria-hidden="true">
                        →
                      </span>
                    </div>
                    <p className={styles.nextCardDesc}>SHAP, Grad-CAM 쉽게 이해하기</p>
                  </div>
                </Link>
                <Link to="/resources/service-start" className={`${styles.nextCard} ${styles.nextCardBlue}`}>
                  <div className={styles.nextCardAccentBlue} aria-hidden="true" />
                  <div className={styles.nextCardBody}>
                    <div className={styles.nextCardTop}>
                      <span className={styles.nextIconBlue} aria-hidden="true">
                        ▶
                      </span>
                      <span className={styles.nextCardTitle}>서비스 시작하기</span>
                      <span className={styles.nextArrowBlue} aria-hidden="true">
                        →
                      </span>
                    </div>
                    <p className={styles.nextCardDesc}>회원가입부터 발전소 등록까지</p>
                  </div>
                </Link>
              </div>
            </section>

            <div className={styles.ctaBanner}>
              <div className={styles.ctaBannerText}>
                <p className={styles.ctaBannerTitle}>지금 바로 대시보드 사용해보기</p>
                <p className={styles.ctaBannerSub}>로그인 후 이용 가능합니다.</p>
              </div>
              <div className={styles.ctaBannerActions}>
                <Link to="/login" className={styles.ctaWhiteButton}>
                  로그인 / 회원가입
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

      <SiteFooter id="footer" />
    </div>
  )
}
