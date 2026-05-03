import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { EChartsCoreOption } from 'echarts/core'
import { SiteFooter } from '@/shared/layout/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import { EChart } from '@/shared/ui/EChart'
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
    description: '기상 예보와 과거 발전 패턴을 바탕으로 향후 발전량 흐름을 예측합니다.',
  },
  {
    title: '패널 이상 감지',
    description: 'YOLO 기반 비전 분석으로 오염, 크랙, 음영 같은 패널 이상을 탐지합니다.',
  },
  {
    title: 'XAI 설명 리포트',
    description: 'SHAP 기여도로 예측과 이상 판단에 영향을 준 주요 피처를 설명합니다.',
  },
  {
    title: '예지 정비 알림',
    description: '반복 이상과 출력 저하 징후를 분석해 정비 우선순위를 알려줍니다.',
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

const heroBars = [45, 58, 72, 62, 78, 55, 46] as const
const heroBarLabels = ['월', '화', '수', '목', '금', '토', '일'] as const
const todayHeroBarIndex = (new Date().getDay() + 6) % 7

const heroChartOption: EChartsCoreOption = {
  animation: false,
  grid: { top: 24, right: 18, bottom: 20, left: 18 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value}%` : '-'),
  },
  xAxis: {
    type: 'category',
    data: heroBarLabels,
    show: false,
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    show: false,
  },
  series: [
    {
      name: '발전량',
      type: 'bar',
      stack: 'hero',
      barWidth: 42,
      data: heroBars.map((value, index) => ({
        value,
        itemStyle: {
          color: index === todayHeroBarIndex ? '#ef9f27' : index % 3 === 1 ? '#378add' : '#185fa5',
          borderRadius: [4, 4, 4, 4],
        },
      })),
    },
    {
      name: '여유 용량',
      type: 'bar',
      stack: 'hero',
      barWidth: 42,
      silent: true,
      tooltip: { show: false },
      data: heroBars.map((value) => ({
        value: 100 - value,
        itemStyle: { color: '#1a2e40', borderRadius: [4, 4, 0, 0] },
      })),
    },
  ],
}

const darkAxisStyle = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: '#2a4a6a', fontSize: 10 },
  splitLine: { lineStyle: { color: '#1e3448' } },
}

const featurePreviews: Array<{
  label: string
  badge: string
  ariaLabel: string
  option: EChartsCoreOption
}> = [
  {
    label: '실시간 발전량 대시보드',
    badge: 'Demo',
    ariaLabel: '실시간 발전량 추세 차트',
    option: {
      color: ['#4da3f2'],
      grid: { top: 34, right: 36, bottom: 42, left: 46 },
      tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value} kWh/kWp` : '-') },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        ...darkAxisStyle,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 6,
        ...darkAxisStyle,
      },
      series: [{ name: '발전량', type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 4 }, data: [1.2, 1.8, 3.2, 4.1, 4.8, 5, 4.6, 3.8, 3.1] }],
    },
  },
  {
    label: 'AI 발전량 예측',
    badge: '● Forecast',
    ariaLabel: 'AI 발전량 예측 차트',
    option: {
      color: ['#1d9e75', '#4da3f2'],
      grid: { top: 34, right: 36, bottom: 42, left: 46 },
      tooltip: { trigger: 'axis', valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value} kWh` : '-') },
      legend: { top: 0, right: 0, textStyle: { color: '#4a7a9b', fontSize: 10 } },
      xAxis: { type: 'category', boundaryGap: false, data: ['오늘', 'D+1', 'D+2', 'D+3', 'D+4'], ...darkAxisStyle },
      yAxis: { type: 'value', min: 500, max: 820, ...darkAxisStyle },
      series: [
        { name: '실측', type: 'line', smooth: true, symbol: 'circle', lineStyle: { width: 3 }, data: [710, 735, null, null, null] },
        { name: '예측', type: 'line', smooth: true, symbol: 'circle', lineStyle: { width: 3 }, areaStyle: { color: 'rgba(77, 163, 242, 0.1)' }, data: [null, 735, 760, 690, 745] },
      ],
    },
  },
  {
    label: '패널 이상 감지',
    badge: '● Vision',
    ariaLabel: '패널 이상 감지 유형별 건수 차트',
    option: {
      color: ['#e24b4a'],
      grid: { top: 30, right: 34, bottom: 42, left: 52 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value}건` : '-') },
      xAxis: { type: 'category', data: ['오염', '크랙', '음영', '출력저하', '통신'], ...darkAxisStyle },
      yAxis: { type: 'value', min: 0, max: 8, ...darkAxisStyle },
      series: [{ name: '이상 감지', type: 'bar', barWidth: 34, data: [4, 2, 3, 6, 1].map((value, index) => ({ value, itemStyle: { color: index === 3 ? '#ef9f27' : '#e24b4a', borderRadius: [6, 6, 0, 0] } })) }],
    },
  },
  {
    label: 'XAI 설명 리포트',
    badge: '● Explain',
    ariaLabel: 'XAI 피처 기여도 차트',
    option: {
      grid: { top: 24, right: 54, bottom: 24, left: 72 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value: unknown) => (typeof value === 'number' ? value.toFixed(2) : '-') },
      xAxis: { type: 'value', min: 0, max: 0.6, show: false },
      yAxis: { type: 'category', inverse: true, data: ['일사량', '기온', '운량', '패널 상태'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#85b7eb', fontSize: 11 } },
      series: [{ name: '기여도', type: 'bar', barWidth: 16, data: [
        { value: 0.52, itemStyle: { color: '#4da3f2', borderRadius: 4 } },
        { value: 0.28, itemStyle: { color: '#1d9e75', borderRadius: 4 } },
        { value: 0.15, itemStyle: { color: '#e24b4a', borderRadius: 4 } },
        { value: 0.1, itemStyle: { color: '#ef9f27', borderRadius: 4 } },
      ] }],
    },
  },
  {
    label: '예지 정비 알림',
    badge: '● Alert',
    ariaLabel: '예지 정비 우선순위 차트',
    option: {
      color: ['#ef9f27'],
      grid: { top: 30, right: 34, bottom: 42, left: 52 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value: unknown) => (typeof value === 'number' ? `${value}%` : '-') },
      xAxis: { type: 'category', data: ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'], ...darkAxisStyle },
      yAxis: { type: 'value', min: 0, max: 100, ...darkAxisStyle },
      series: [{ name: '정비 필요도', type: 'bar', barWidth: 34, data: [42, 68, 35, 84, 57].map((value) => ({ value, itemStyle: { color: value > 75 ? '#e24b4a' : '#ef9f27', borderRadius: [6, 6, 0, 0] } })) }],
    },
  },
]

export function HomePage() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
  const activeFeaturePreview = featurePreviews[activeFeatureIndex] ?? featurePreviews[0]

  return (
    <div className={styles.page}>
      <SiteHeader ariaLabel="홈 페이지 메뉴" />

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

                <EChart
                  ariaLabel="오늘 발전량 막대 차트"
                  className={styles.barChart}
                  option={heroChartOption}
                />
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
                    <button
                      key={feature.title}
                      className={[styles.featureCard, activeFeatureIndex === index ? styles.featureCardActive : ''].filter(Boolean).join(' ')}
                      type="button"
                      aria-pressed={activeFeatureIndex === index}
                      onClick={() => setActiveFeatureIndex(index)}
                    >
                      <div>
                        <h3>{feature.title}</h3>
                        {feature.description ? <p>{feature.description}</p> : null}
                      </div>
                      {activeFeatureIndex === index ? null : <span className={styles.featureArrow}>›</span>}
                    </button>
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
                  <span className={styles.liveBadge}>{activeFeaturePreview.badge}</span>
                </div>
                <p className={styles.featurePreviewLabel}>{activeFeaturePreview.label}</p>

                <div className={styles.featureChart}>
                  <EChart
                    ariaLabel={activeFeaturePreview.ariaLabel}
                    className={styles.featureEChart}
                    option={activeFeaturePreview.option}
                  />
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

      <SiteFooter />
    </div>
  )
}
