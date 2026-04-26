import { Link } from 'react-router-dom'
import { useHideOnScroll } from '@/shared/hooks/useHideOnScroll'
import styles from './HomePage.module.css'

const metrics = [
  { value: '1,240+', label: '연동 발전소' },
  { value: '38,500 MWh', label: '누적 모니터링 발전량' },
  { value: '94.7%', label: 'AI 결함 감지 정확도' },
  { value: '31%', label: '평균 유지보수 비용 절감' },
] as const

const problems = [
  {
    id: '01',
    title: '패널 먼지 방치',
    description: '먼지 밀도가 일정 수준에 달하면 출력 전력의 최대 34%가 감소합니다.',
    impact: '출력 -34%',
  },
  {
    id: '02',
    title: '사후 고장 대응',
    description: '고장 발생 후에야 알게 되는 구조로 가동 중단 손실이 누적됩니다.',
    impact: '비용 손실',
  },
  {
    id: '03',
    title: '발전량 예측 불가',
    description: '기상 변동에 따른 불확실성으로 정확한 수익 계획 수립이 어렵습니다.',
    impact: '수익 불확실',
  },
  {
    id: '04',
    title: 'AI 판단 근거 불명',
    description: '기존 시스템은 왜 그런 판단을 내렸는지 명확하게 설명해주지 않습니다.',
    impact: '블랙박스',
  },
] as const

const featureTabs = [
  {
    title: '실시간 발전량 트래킹',
    description: '인버터와 센서 데이터를 시계열 차트로 통합 시각화하고, 온도와 일사량까지 함께 봅니다.',
  },
  {
    title: 'AI 발전량 예측 (2~3일)',
    description: '',
  },
  {
    title: '패널 이상 감지',
    description: '',
  },
  {
    title: 'XAI 설명 리포트',
    description: '',
  },
  {
    title: '예지 정비 알림',
    description: '',
  },
] as const

const steps = [
  {
    step: '01',
    title: '회원가입',
    description: '가입 즉시 모든 기능 무료 이용',
    tone: 'blue',
  },
  {
    step: '02',
    title: '발전소 연동',
    description: '인버터·센서 API 자동 지원',
    tone: 'green',
  },
  {
    step: '03',
    title: '데이터 분석',
    description: '실시간 발전량과 기상·이미지 자동 수집',
    tone: 'orange',
  },
  {
    step: '04',
    title: 'AI 인사이트',
    description: '예측·결함·알림 자동 정리',
    tone: 'blue',
  },
] as const

const footerColumns = [
  {
    title: '서비스',
    links: ['실시간 모니터링', 'AI 예측', '결함 감지', 'XAI 리포트'],
  },
  {
    title: '팀',
    links: ['팀 소개', '파트너십'],
  },
  {
    title: '리소스',
    links: ['블로그', '기술 문서', 'FAQ'],
  },
] as const

export function HomePage() {
  const heroBars = [45, 58, 72, 62, 78, 55, 46, 60] as const
  const isHeaderHidden = useHideOnScroll()

  return (
    <div className={styles.page}>
      <header className={[styles.header, 'gnb-scroll-header', isHeaderHidden ? 'gnb-scroll-header--hidden' : ''].filter(Boolean).join(' ')}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.brand} aria-label="SolarWise 홈">
              <span className={styles.brandSun} />
              <span className={styles.brandTextPrimary}>Solar</span>
              <span className={styles.brandTextAccent}>Wise</span>
            </Link>

            <nav className={styles.nav} aria-label="홈 페이지 메뉴">
              <Link to="/services">서비스 소개</Link>
              <Link to="/dashboard">대시보드</Link>
              <a href="#resources">리소스</a>
              <Link to="/about">팀 소개</Link>
            </nav>

            <div className={styles.headerActions}>
              <Link to="/login" className={styles.loginLink}>
                로그인
              </Link>
              <Link to="/signup" className={styles.headerButton}>
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section id="about" className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                회원가입만 하면 모든 기능 무료
              </div>

              <h1 className={styles.heroTitle}>
                <span>AI로 태양광 발전소를</span>
                <span>더 스마트하게</span>
                <span className={styles.heroTitleAccent}>관리하세요</span>
              </h1>

              <p className={styles.heroLead}>실시간 발전량 트래킹부터 AI 결함 감지, 발전량 예측까지 SolarWise 하나로 해결합니다.</p>

              <div className={styles.heroActions}>
                <Link to="/signup" className={styles.primaryButton}>
                  무료 회원가입하기 →
                </Link>
                <button type="button" className={styles.secondaryButton}>
                  ▶ 데모 영상 보기
                </button>
              </div>
            </div>

            <div className={styles.heroPreview}>
              <div className={styles.previewPanel} aria-hidden="true">
                <div className={styles.previewHeader}>
                  <span className={styles.previewDot} />
                  <span className={styles.previewDot} />
                  <span className={styles.previewDot} />
                </div>

                <div className={styles.previewStats}>
                  <article className={styles.previewStatCard}>
                    <span>오늘 발전량</span>
                    <strong>7,175 kWh</strong>
                    <em>↑ 전일 대비 +4.2%</em>
                  </article>
                  <article className={styles.previewStatCard}>
                    <span>이상 감지</span>
                    <strong className={styles.warningValue}>4개소</strong>
                    <em className={styles.warningText}>즉시 확인 필요</em>
                  </article>
                </div>

                <div className={styles.barChart}>
                  {heroBars.map((height, index) => (
                    <div key={height} className={styles.barTrack}>
                      <span
                        className={[
                          styles.barFill,
                          index === heroBars.length - 2 ? styles.barHighlight : '',
                          index % 3 === 1 ? styles.barSecondary : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.metricsSection}>
          <div className={[styles.container, styles.metricsGrid].join(' ')}>
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="problems" className={styles.problemSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrowProblem}>PROBLEM</span>
              <h2>기존 태양광 관리, 이런 문제 없으셨나요?</h2>
            </div>

            <div className={styles.problemGrid}>
              {problems.map((problem) => (
                <article key={problem.id} className={styles.problemCard}>
                  <div className={styles.problemCardTop}>
                    <span className={styles.problemIndex}>{problem.id}</span>
                    <span className={styles.problemIcon}>✕</span>
                  </div>
                  <h3>{problem.title}</h3>
                  <p>{problem.description}</p>
                  <div className={styles.problemImpact}>{problem.impact}</div>
                </article>
              ))}
            </div>

            <div className={styles.problemBanner}>✓ SolarWise는 이 모든 문제를 데이터와 AI로 해결합니다.</div>
          </div>
        </section>

        <section id="features" className={styles.featureSection}>
          <div className={styles.container}>
            <div className={styles.featureLayout}>
              <div className={styles.featureContent}>
                <span className={styles.sectionEyebrow}>FEATURES</span>
                <h2>발전소 관리의 모든 것, 하나로</h2>

                <div className={styles.featureList}>
                  {featureTabs.map((feature, index) => (
                    <article
                      key={feature.title}
                      className={[styles.featureCard, index === 0 ? styles.featureCardActive : ''].filter(Boolean).join(' ')}
                    >
                      <div>
                        <h3>{feature.title}</h3>
                        {feature.description ? <p>{feature.description}</p> : null}
                      </div>
                      {index === 0 ? null : <span className={styles.featureArrow}>›</span>}
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.featurePreview}>
                <div className={styles.featurePreviewTop}>
                  <div className={styles.previewDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className={styles.liveBadge}>● Live</span>
                </div>
                <p className={styles.featurePreviewLabel}>실시간 발전량 대시보드</p>

                <div className={styles.featureChart}>
                  <div className={styles.chartGridLines}>
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <svg viewBox="0 0 820 320" className={styles.chartSvg} role="img" aria-label="발전량 추세 차트">
                    <polyline
                      points="0,280 60,250 120,180 180,120 240,90 300,64 360,40 420,32 480,44 540,70 600,95 660,118 740,136 820,156"
                      className={styles.chartLine}
                    />
                  </svg>
                  <div className={styles.chartCallout}>4.8 kWh/kWp</div>
                  <div className={styles.chartAxis}>
                    <span>09:00</span>
                    <span>11:00</span>
                    <span>13:00</span>
                    <span>15:00</span>
                    <span>17:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className={styles.workflowSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>HOW IT WORKS</span>
              <h2>4단계로 시작하는 스마트 관리</h2>
            </div>

            <div className={styles.stepGrid}>
              {steps.map((item) => (
                <article
                  key={item.step}
                  className={[
                    styles.stepCard,
                    item.tone === 'green' ? styles.stepCardGreen : '',
                    item.tone === 'orange' ? styles.stepCardOrange : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.stepBadge}>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={[styles.container, styles.ctaInner].join(' ')}>
            <div className={styles.ctaContent}>
              <h2>지금 바로 발전소를 AI와 연결하세요</h2>
              <p>회원가입만으로 모든 기능 무료 · 신용카드 불필요</p>
            </div>

            <div className={styles.ctaActions}>
              <Link to="/signup" className={styles.primaryButton}>
                무료 회원가입하기
              </Link>
              <Link to="/services" className={styles.ctaSecondaryButton}>
                서비스 더 알아보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="resources" className={styles.footer}>
        <div className={[styles.container, styles.footerInner].join(' ')}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.brandSun} />
              <strong>Solar</strong>
              <strong className={styles.brandTextAccent}>Wise</strong>
            </div>
            <p>AI가 지키는 당신의 발전소</p>

            <form className={styles.footerForm}>
              <input className={styles.footerInput} placeholder="이메일 주소" aria-label="이메일 주소" />
              <button type="button" className={styles.footerButton}>
                구독하기
              </button>
            </form>
          </div>

          <div id="team" className={styles.footerLinks}>
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={[styles.container, styles.footerMeta].join(' ')}>
          <p>© 2026 SolarWise · 개인정보처리방침 · 이용약관</p>
          <p>LinkedIn · GitHub · YouTube</p>
        </div>
      </footer>
    </div>
  )
}
