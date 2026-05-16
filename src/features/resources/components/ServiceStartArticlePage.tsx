import { Link } from 'react-router-dom'
import { SiteFooter } from '@/shared/layout/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './ServiceStartArticlePage.module.css'

const outlineItems = [
  { href: '#step-1', label: '1. 회원가입' },
  { href: '#step-2', label: '2. 발전소 등록' },
  { href: '#step-3', label: '3. 센서 연동' },
  { href: '#step-4', label: '4. 대시보드 확인' },
] as const

export function ServiceStartArticlePage() {
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
              <span className={styles.breadcrumbCurrent}>서비스 시작하기</span>
            </nav>

            <div className={styles.guideBadge}>▶ 가이드</div>

            <h1 className={styles.articleTitle}>
              <span>SolarWise 서비스</span>
              <span>시작하기</span>
            </h1>

            <div className={styles.articleMeta}>
              <span>읽기 시간: 5분</span>
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
              <span>업데이트: 2026.04.06</span>
              <span className={styles.metaDot} aria-hidden="true">
                ·
              </span>
              <span className={styles.metaHighlight}>초보자 필독</span>
            </div>

            <div className={styles.headerDivider} aria-hidden="true" />

            <div className={styles.outline}>
              <strong className={styles.outlineLabel}>이 가이드에서 배우는 것</strong>
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
                <h2 className={styles.sectionTitle}>회원가입</h2>
              </div>
              <p className={styles.sectionLead}>SolarWise에 가입하고 발전소를 관리할 계정을 만드세요. 이메일과 비밀번호만 있으면 됩니다.</p>

              <div className={styles.stepList}>
                <div className={styles.stepListRail} aria-hidden="true" />
                <ol className={styles.stepListInner}>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>①</span>
                    <span>
                      <Link to="/signup" className={styles.inlineLink}>
                        회원가입 페이지
                      </Link>
                      로 이동합니다.
                    </span>
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>②</span>
                    이름, 이메일, 비밀번호 입력
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>③</span>
                    이메일 인증 완료 (인증 메일 발송)
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>④</span>
                    역할 선택 → OWNER (발전소 소유자)
                  </li>
                </ol>
              </div>

              <div className={`${styles.callout} ${styles.calloutGreen}`}>
                <span className={styles.calloutIcon} aria-hidden="true">
                  ◆
                </span>
                <p>비밀번호는 영문+숫자+특수문자 조합 8자 이상이어야 합니다.</p>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section id="step-2" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNum}>2</span>
                <h2 className={styles.sectionTitle}>발전소 등록</h2>
              </div>
              <p className={styles.sectionLead}>회원가입 후 내 발전소를 등록하세요. 기본 정보와 설비 정보를 입력하면 됩니다.</p>

              <div className={styles.stepList}>
                <div className={styles.stepListRail} aria-hidden="true" />
                <ol className={styles.stepListInner}>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>①</span>
                    <Link to="/settings/plant" className={styles.inlineLink}>
                      환경설정 → 발전소 관리
                    </Link>
                    <span className={styles.stepListRest}>에서 발전소 정보를 등록합니다.</span>
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>②</span>
                    발전소명, 위치, 설비 용량(kW) 입력
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>③</span>
                    인버터 모델명 입력 (예: INV-3000)
                  </li>
                  <li className={styles.stepListItem}>
                    <span className={styles.stepListMark}>④</span>
                    등록 완료!
                  </li>
                </ol>
              </div>

              <div className={`${styles.callout} ${styles.calloutBlue}`}>
                <span className={styles.calloutIcon} aria-hidden="true">
                  ◆
                </span>
                <p>발전소 등록 후 사이드바에 발전소 이름이 표시되고 대시보드를 바로 확인할 수 있어요.</p>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section id="step-3" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNum}>3</span>
                <h2 className={styles.sectionTitle}>센서 연동</h2>
              </div>
              <p className={styles.sectionLead}>인버터 및 센서를 SolarWise에 연동하면 실시간 발전량 데이터를 받아볼 수 있어요.</p>

              <div className={styles.sensorGrid}>
                <div className={`${styles.sensorCard} ${styles.sensorCardPrimary}`}>
                  <div className={styles.sensorCardAccent} aria-hidden="true" />
                  <h3 className={styles.sensorCardTitle}>◉ 센서가 있는 경우</h3>
                  <p className={styles.sensorCardText}>발전소 등록 시 센서 시리얼 번호(SNSR-XXXX)를 입력하면 자동으로 연동됩니다.</p>
                </div>
                <div className={`${styles.sensorCard} ${styles.sensorCardMuted}`}>
                  <div className={`${styles.sensorCardAccent} ${styles.sensorCardAccentMuted}`} aria-hidden="true" />
                  <h3 className={styles.sensorCardTitleMuted}>◎ 센서가 없는 경우</h3>
                  <p className={styles.sensorCardTextMuted}>인버터 데이터만으로도 기본 모니터링이 가능합니다. 센서는 이후에 추가 연동할 수 있어요.</p>
                </div>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section id="step-4" className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={`${styles.stepNum} ${styles.stepNumGreen}`}>4</span>
                <h2 className={styles.sectionTitle}>대시보드 확인</h2>
              </div>
              <p className={styles.sectionLead}>모든 설정이 완료되면 대시보드에서 실시간 발전량을 바로 확인할 수 있어요!</p>

              <div className={styles.dashboardMock}>
                <div className={styles.dashboardGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>현재 발전량</span>
                    <strong className={styles.statValue}>92.4 kW</strong>
                    <span className={styles.statTrend}>↑ 정상</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>오늘 발전량</span>
                    <strong className={`${styles.statValue} ${styles.statMint}`}>538.2 kWh</strong>
                    <span className={styles.statTrend}>↑ 정상</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>발전 효율</span>
                    <strong className={`${styles.statValue} ${styles.statAmber}`}>87.1%</strong>
                    <span className={styles.statTrend}>↑ 정상</span>
                  </div>
                </div>
              </div>

              <div className={styles.successBanner}>
                <span className={styles.successMark} aria-hidden="true">
                  ✓
                </span>
                <p className={styles.successText}>설정 완료! 이제 SolarWise로 발전소를 실시간으로 관리할 수 있어요.</p>
              </div>
            </section>

            <div className={styles.sectionRule} aria-hidden="true" />

            <section className={styles.nextSection} aria-labelledby="next-read">
              <h2 id="next-read" className={styles.nextHeading}>
                다음으로 읽어보세요
              </h2>
              <div className={styles.nextGrid}>
                <Link to="/resources/dashboard-guide" className={`${styles.nextCard} ${styles.nextCardGreen}`}>
                  <div className={styles.nextCardAccentGreen} aria-hidden="true" />
                  <div className={styles.nextCardBody}>
                    <div className={styles.nextCardTop}>
                      <span className={styles.nextIconGreen} aria-hidden="true">
                        ◈
                      </span>
                      <span className={styles.nextCardTitle}>대시보드 100% 활용</span>
                      <span className={styles.nextArrowGreen} aria-hidden="true">
                        →
                      </span>
                    </div>
                    <p className={styles.nextCardDesc}>실시간 차트, 이상 감지, AI 예측 기능을 모두 활용하는 방법입니다.</p>
                  </div>
                </Link>
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
                    <p className={styles.nextCardDesc}>SHAP, Grad-CAM 등 AI 용어를 비전문가 언어로 쉽게 설명합니다.</p>
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
