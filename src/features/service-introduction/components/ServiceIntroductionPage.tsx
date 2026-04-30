import { Link } from 'react-router-dom'
import { SiteFooter } from '@/shared/layout/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './ServiceIntroductionPage.module.css'

const heroHighlights = [
  { title: '실시간 발전량 트래킹', description: '5m 간격 실시간 업데이트', tone: 'blue' },
  { title: 'AI 발전량 예측 (2~3일)', description: '기상청 API 실시간 연동', tone: 'green' },
  { title: 'AI 패널 이상 감지', description: '크랙·먼지·눈 오염 자동 감지', tone: 'red' },
  { title: 'XAI 설명 리포트', description: 'AI 판단 근거 투명 공개', tone: 'orange' },
  { title: '예지 정비 알림', description: '고장 전 사전 포착', tone: 'blue' },
] as const

const featureSections = [
  {
    id: 'tracking',
    eyebrow: '01  ·  REALTIME TRACKING',
    title: '실시간 발전량 트래킹',
    description: '인버터·센서 데이터를 시계열 차트로 실시간 시각화. 온도, 일사량까지 통합 모니터링합니다.',
    bullets: ['인버터 자동 연동 (주요 제조사 지원)', '온도·일사량·발전량 통합 차트', '이상 수치 즉시 하이라이트', '시간·일·주·월 단위 조회'],
    cta: '실시간 발전량 트래킹 자세히 알아보기 →',
    reverse: false,
    visual: 'tracking',
    tone: 'blue',
  },
  {
    id: 'forecast',
    eyebrow: '02  ·  AI FORECAST',
    title: 'AI 발전량 예측 (2~3일)',
    description: '기상청 API(기온, 강수량, 습도)와 과거 발전 패턴을 결합하여 향후 2~3일 발전량을 예측합니다.',
    bullets: ['기상청 API 실시간 연동', '시간·일 단위 예측 제공', 'XGBoost 기반 · 기상청 API 연동', '예측 결과 CSV 다운로드'],
    cta: 'AI 발전량 예측 (2~3일) 자세히 알아보기 →',
    reverse: true,
    visual: 'forecast',
    tone: 'green',
  },
  {
    id: 'detection',
    eyebrow: '03  ·  PANEL DETECTION',
    title: 'AI 패널 이상 감지',
    description: '드론 고해상도 영상 분석으로 크랙·먼지·눈 오염을 자동 식별하고 패널 수명까지 예측합니다.',
    bullets: ['크랙·먼지·눈 오염 자동 감지', '핫스팟 이상 감지', 'Grad-CAM 히트맵 시각화', '감지 즉시 알림 발송'],
    cta: 'AI 패널 이상 감지 자세히 알아보기 →',
    reverse: false,
    visual: 'detection',
    tone: 'red',
  },
  {
    id: 'report',
    eyebrow: '04  ·  XAI REPORT',
    title: 'XAI 설명 리포트',
    description: '왜 이렇게 예측했는지 AI가 직접 설명합니다. 운량·미세먼지 등 원인을 사용자 언어로 제공합니다.',
    bullets: ['예측 근거 자동 생성', '원인별 기여도 시각화', '비전문가도 이해 가능한 설명', '리포트 PDF 다운로드'],
    cta: 'XAI 설명 리포트 자세히 알아보기 →',
    reverse: true,
    visual: 'report',
    tone: 'orange',
  },
  {
    id: 'maintenance',
    eyebrow: '05  ·  PREDICTIVE MAINTENANCE',
    title: '예지 정비 알림',
    description: '고장이 발생하기 전에 징후를 포착합니다. 데이터 분석으로 사전 예지 정비 환경을 구현합니다.',
    bullets: ['고장 징후 사전 포착', '이메일·앱 푸시 알림 발송', '맞춤 솔루션 자동 제시', '정비 이력 관리'],
    cta: '예지 정비 알림 자세히 알아보기 →',
    reverse: false,
    visual: 'maintenance',
    tone: 'blue',
  },
] as const

type Tone = (typeof featureSections)[number]['tone']
type Visual = (typeof featureSections)[number]['visual']

function getToneClass(tone: Tone) {
  return (
    {
      blue: styles.toneBlue,
      green: styles.toneGreen,
      red: styles.toneRed,
      orange: styles.toneOrange,
    } as const
  )[tone]
}

function FeatureVisual({ visual }: { visual: Visual }) {
  if (visual === 'tracking') {
    return (
      <div className={styles.visualWindow}>
        <div className={styles.visualToolbar}>
          <div className={styles.windowDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>실시간 발전량 대시보드</strong>
          <em>● Live</em>
        </div>
        <div className={styles.chartPanel}>
          <div className={styles.chartGrid} aria-hidden="true" />
          <div className={styles.barChart}>
            {[38, 55, 68, 52, 76, 60, 48, 64].map((height, index) => (
              <span key={`${height}-${index}`} style={{ height: `${height}%`, opacity: 0.28 + index * 0.06 }} />
            ))}
          </div>
        </div>
        <p className={styles.visualCaption}>발전량 · 온도 · 일사량 통합 뷰</p>
      </div>
    )
  }

  if (visual === 'forecast') {
    return (
      <div className={styles.visualWindow}>
        <div className={styles.visualToolbar}>
          <div className={styles.windowDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>2~3일 발전량 예측 차트</strong>
          <em>AI Powered</em>
        </div>
        <div className={styles.chartPanel}>
          <div className={styles.forecastAxes} aria-hidden="true" />
          <span className={styles.currentLine}>현재</span>
          <span className={styles.forecastRange}>예측 구간</span>
          <svg viewBox="0 0 520 220" role="img" aria-label="발전량 예측 곡선">
            <polyline className={styles.actualLine} points="0,190 38,58 76,110 114,132 152,98 190,82 228,116 260,104" />
            <polyline className={styles.predictedLine} points="260,104 300,78 340,76 380,92 420,176 460,118 500,82 520,88" />
          </svg>
        </div>
        <div className={styles.visualLegend}>
          <span>실측값</span>
          <span>예측값 (XGBoost)</span>
        </div>
      </div>
    )
  }

  if (visual === 'detection') {
    return (
      <div className={styles.visualWindow}>
        <div className={styles.visualToolbar}>
          <div className={styles.windowDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>패널 히트맵 & 결함 감지</strong>
          <em>⚠ 이상 감지</em>
        </div>
        <div className={styles.heatmapGrid} aria-label="이상 패널 위치 시각화">
          {['ok', 'ok', 'danger', 'ok', 'ok', 'warn', 'ok', 'ok', 'ok', 'ok', 'danger', 'ok'].map((status, index) => (
            <span key={`${status}-${index}`} className={styles[`heatmap${status}` as keyof typeof styles]} />
          ))}
        </div>
        <p className={styles.visualCaption}>이상 패널 위치 시각화</p>
      </div>
    )
  }

  if (visual === 'report') {
    return (
      <div className={styles.visualWindow}>
        <div className={styles.visualToolbar}>
          <div className={styles.windowDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>XAI 원인 분석 카드</strong>
          <em>XAI 분석</em>
        </div>
        <div className={styles.xaiPanel}>
          {[
            ['운량 증가', '52%'],
            ['미세먼지', '28%'],
            ['기온 하락', '20%'],
          ].map(([label, value]) => (
            <div key={label} className={styles.xaiFactor}>
              <span>{label}</span>
              <div>
                <i style={{ width: value }} />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className={styles.visualCaption}>요인별 기여도 & 설명 텍스트</p>
      </div>
    )
  }

  return (
    <div className={styles.maintenanceWindow}>
      <div className={styles.maintenanceToolbar}>
        <div className={styles.windowDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>예지 정비 알림 카드</strong>
        <em>예지 정비</em>
      </div>
      <div className={styles.alertStack}>
        <article className={styles.alertDanger}>
          <strong>🔴 크랙 감지 — 즉시 조치</strong>
          <span>영암 솔라 3구역</span>
        </article>
        <article className={styles.alertWarning}>
          <strong>⚠ 먼지 오염 — 세척 권장</strong>
          <span>보성 태양광 전체</span>
        </article>
        <article className={styles.alertSuccess}>
          <strong>✅ 정상 운영 중</strong>
          <span>양평 1호 · 합천 에너지팜</span>
        </article>
      </div>
      <p className={styles.visualCaption}>심각도별 알림 & 솔루션 제시</p>
    </div>
  )
}

export function ServiceIntroductionPage() {
  return (
    <div className={styles.page}>
      <SiteHeader active="services" ariaLabel="서비스 소개 페이지 메뉴" />

      <main>
        <section className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div className={styles.heroContent}>
              <div className={styles.heroPill}>
                <span aria-hidden="true" />
                5가지 핵심 기능 · 모두 무료
              </div>
              <h1 className={styles.heroTitle}>
                <span>태양광 발전소 운영의 모든 것,</span>
                <span className={styles.heroTitleAccent}>AI로 자동화하다</span>
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
                  key={item.title}
                  className={[
                    styles.heroHighlight,
                    item.tone === 'green' ? styles.heroHighlightGreen : '',
                    item.tone === 'red' ? styles.heroHighlightRed : '',
                    item.tone === 'orange' ? styles.heroHighlightOrange : '',
                    index === heroHighlights.length - 1 ? styles.heroHighlightWide : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
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
                <span className={[styles.featureEyebrow, getToneClass(section.tone)].join(' ')}>{section.eyebrow}</span>
                <h2>{section.title}</h2>
                <div className={[styles.sectionBar, getToneClass(section.tone)].join(' ')} />
                <p>{section.description}</p>
                <ul className={[styles.featureList, getToneClass(section.tone)].join(' ')}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <a href={`#${section.id}`} className={[styles.featureLink, getToneClass(section.tone)].join(' ')}>
                  {section.cta}
                </a>
              </div>

              <div className={[styles.featureVisualWrap, getToneClass(section.tone)].join(' ')}>
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

      <SiteFooter id="footer" />
    </div>
  )
}
