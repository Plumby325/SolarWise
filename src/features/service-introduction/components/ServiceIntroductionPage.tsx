import { Link } from 'react-router-dom'
import styles from './ServiceIntroductionPage.module.css'

const heroHighlights = ['📊 실시간 트래킹', '🔮 AI 발전량 예측', '🔍 패널 이상 감지', '🧠 XAI 설명', '🔔 예지 정비'] as const

const featureSections = [
  {
    id: 'tracking',
    eyebrow: '01  ·  REALTIME TRACKING',
    title: '실시간 발전량 트래킹',
    description: '인버터·센서 데이터를 시계열 차트로 실시간 시각화. 온도, 일사량까지 통합 모니터링합니다.',
    bullets: ['인버터 자동 연동 (주요 제조사 지원)', '온도·일사량·발전량 통합 차트', '이상 수치 즉시 하이라이트', '시간·일·주·월 단위 조회'],
    reverse: false,
    visual: 'tracking',
  },
  {
    id: 'forecast',
    eyebrow: '02  ·  AI FORECAST',
    title: 'AI 발전량 예측 (2~3일)',
    description: '기상청 API(기온, 강수량, 습도)와 과거 발전 패턴을 결합하여 향후 2~3일 발전량을 예측합니다.',
    bullets: ['기상청 API 실시간 연동', '시간·일 단위 예측 제공', '예측 오차율 평균 2.1% 수준', '예측 결과 CSV 다운로드'],
    reverse: true,
    visual: 'forecast',
  },
  {
    id: 'detection',
    eyebrow: '03  ·  PANEL DETECTION',
    title: 'AI 패널 이상 감지',
    description: 'AI 이미지 분석으로 크랙·먼지·눈 오염을 자동 식별하고 패널 수명까지 예측합니다.',
    bullets: ['크랙·먼지·눈 오염 자동 감지', '핫스팟 이상 감지', '패널 수명 예측', '감지 즉시 알림 발송'],
    reverse: false,
    visual: 'detection',
  },
  {
    id: 'report',
    eyebrow: '04  ·  XAI REPORT',
    title: 'XAI 설명 리포트',
    description: '왜 이렇게 예측했는지 AI가 직접 설명합니다. 운량·미세먼지 등 원인을 사용자 언어로 제공합니다.',
    bullets: ['예측 근거 자동 생성', '원인별 기여도 시각화', '비전문가도 이해 가능한 설명', '리포트 PDF 다운로드'],
    reverse: true,
    visual: 'report',
  },
  {
    id: 'maintenance',
    eyebrow: '05  ·  PREDICTIVE MAINTENANCE',
    title: '예지 정비 알림',
    description: '고장이 발생하기 전에 징후를 포착합니다. 데이터 분석으로 사전 예지 정비 환경을 구현합니다.',
    bullets: ['고장 징후 사전 포착', '이메일·앱 푸시 알림 발송', '맞춤 솔루션 자동 제시', '정비 이력 관리'],
    reverse: false,
    visual: 'maintenance',
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

function FeatureVisual({ visual }: { visual: (typeof featureSections)[number]['visual'] }) {
  if (visual === 'tracking') {
    return (
      <div className={styles.visualTracking}>
        <div className={styles.visualBadge}>Live Monitoring</div>
        <div className={styles.trackingStats}>
          <div>
            <span>오늘 발전량</span>
            <strong>7,175 kWh</strong>
          </div>
          <div>
            <span>온도</span>
            <strong>31.4℃</strong>
          </div>
        </div>
        <div className={styles.trackingChart}>
          {[38, 52, 70, 82, 75, 60, 44].map((height) => (
            <span key={height} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (visual === 'forecast') {
    return (
      <div className={styles.visualForecast}>
        <div className={styles.forecastTop}>
          <div className={styles.forecastPill}>72h Forecast</div>
          <div className={styles.forecastRate}>오차율 2.1%</div>
        </div>
        <div className={styles.forecastCurve}>
          <svg viewBox="0 0 520 220" role="img" aria-label="발전량 예측 곡선">
            <polyline points="0,180 70,150 140,122 210,112 280,70 350,84 420,58 520,40" />
          </svg>
        </div>
        <div className={styles.forecastDays}>
          <div>
            <span>오늘</span>
            <strong>4.8</strong>
          </div>
          <div>
            <span>내일</span>
            <strong>5.1</strong>
          </div>
          <div>
            <span>모레</span>
            <strong>4.6</strong>
          </div>
        </div>
      </div>
    )
  }

  if (visual === 'detection') {
    return (
      <div className={styles.visualDetection}>
        <div className={styles.detectionImage}>
          <span className={[styles.detectionTag, styles.detectionTagPrimary].join(' ')}>Crack 92%</span>
          <span className={[styles.detectionTag, styles.detectionTagSecondary].join(' ')}>Dust 88%</span>
          <span className={[styles.detectionBox, styles.detectionBoxLarge].join(' ')} />
          <span className={[styles.detectionBox, styles.detectionBoxSmall].join(' ')} />
        </div>
        <div className={styles.detectionLegend}>
          <span>패널 이미지 자동 분석</span>
          <strong>이상 2건 감지</strong>
        </div>
      </div>
    )
  }

  if (visual === 'report') {
    return (
      <div className={styles.visualReport}>
        <div className={styles.reportCard}>
          <span className={styles.reportTitle}>예측 근거</span>
          <strong>운량 증가 영향</strong>
          <p>오후 시간대 일사량 감소가 주요 원인입니다.</p>
        </div>
        <div className={styles.reportChat}>
          <div className={[styles.reportMessage, styles.reportMessageUser].join(' ')}>
            오늘 오후 발전량이 예상보다 낮게 나온 이유가 뭐야?
          </div>
          <div className={[styles.reportMessage, styles.reportMessageAssistant].join(' ')}>
            14시 이후 운량이 빠르게 증가하면서 일사량이 감소했고, 그 영향으로 예상 발전량보다 출력이 낮아졌습니다.
          </div>
          <div className={[styles.reportMessage, styles.reportMessageAssistant].join(' ')}>
            미세먼지와 온도 변화도 일부 영향을 줬지만, 이번 하락의 가장 큰 원인은 구름량 증가입니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.visualMaintenance}>
      <div className={styles.maintenanceAlert}>
        <span>위험 알림</span>
        <strong>인버터 출력 이상 징후</strong>
        <p>점검 권장 · 예상 조치 시간 20분</p>
      </div>
      <div className={styles.maintenanceTimeline}>
        <div>
          <b>09:00</b>
          <span>데이터 이상 탐지</span>
        </div>
        <div>
          <b>09:03</b>
          <span>이메일 및 앱 푸시 발송</span>
        </div>
        <div>
          <b>09:10</b>
          <span>맞춤 조치 가이드 제공</span>
        </div>
      </div>
    </div>
  )
}

export function ServiceIntroductionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.logo} aria-label="SolarWise 홈">
              <span className={styles.logoBox}>Logo</span>
            </Link>

            <nav className={styles.nav} aria-label="서비스 소개 페이지 메뉴">
              <Link to="/services" className={styles.navActive}>
                서비스 소개
              </Link>
              <Link to="/dashboard">대시보드</Link>
              <a href="#footer">리소스</a>
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
        <section className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div className={styles.heroContent}>
              <div className={styles.heroPill}>5가지 핵심 기능 · 모두 무료</div>
              <h1 className={styles.heroTitle}>
                <span>태양광 발전소 운영의 모든 것,</span>
                <span>AI로 자동화하다</span>
              </h1>
              <p className={styles.heroDescription}>
                발전량 추적부터 패널 결함 감지, 예지 정비까지
                <br />
                하나의 플랫폼에서 모두 해결하세요.
              </p>

              <div className={styles.heroActions}>
                <Link to="/signup" className={styles.primaryButton}>
                  무료 회원가입 →
                </Link>
                <a href="#tracking" className={styles.secondaryButton}>
                  기능 살펴보기 ↓
                </a>
              </div>
            </div>

            <div className={styles.heroHighlights}>
              {heroHighlights.map((item, index) => (
                <div
                  key={item}
                  className={[
                    styles.heroHighlight,
                    index === heroHighlights.length - 1 ? styles.heroHighlightWide : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {featureSections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            className={[styles.featureSection, index % 2 === 1 ? styles.featureSectionAlt : ''].filter(Boolean).join(' ')}
          >
            <div
              className={[
                styles.container,
                styles.featureInner,
                section.reverse ? styles.featureInnerReverse : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.featureContent}>
                <span className={styles.featureEyebrow}>{section.eyebrow}</span>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
                <ul className={styles.featureList}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.featureVisualWrap}>
                <FeatureVisual visual={section.visual} />
              </div>
            </div>
          </section>
        ))}

        <section className={styles.ctaSection}>
          <div className={[styles.container, styles.ctaInner].join(' ')}>
            <h2>5가지 기능, 모두 무료로 시작하세요</h2>
            <p>회원가입만으로 즉시 이용 가능 · 신용카드 불필요</p>
            <div className={styles.ctaActions}>
              <Link to="/signup" className={styles.primaryButton}>
                무료 회원가입하기
              </Link>
              <Link to="/dashboard" className={styles.secondaryButton}>
                대시보드 미리보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span className={styles.footerLogoDot} />
                <span className={styles.footerLogoPrimary}>Solar</span>
                <span className={styles.footerLogoAccent}>Wise</span>
              </div>
              <p>AI가 지키는 당신의 발전소</p>

              <form className={styles.footerForm}>
                <input type="email" placeholder="이메일 주소" aria-label="이메일 주소" />
                <button type="button">구독하기</button>
              </form>
            </div>

            <div className={styles.footerLinks}>
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

          <div className={styles.footerMeta}>
            <p>© 2026 SolarWise · 개인정보처리방침 · 이용약관</p>
            <p>LinkedIn · GitHub · YouTube</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
