import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { useHomeForm } from '../hooks/useHomeForm'
import styles from './HomePage.module.css'

const stats = [
  { value: '1,240+', label: '누적 진단 프로젝트' },
  { value: '38,500 MWh', label: '분석 완료 발전량' },
  { value: '94.7%', label: '예측 모델 평균 정확도' },
  { value: '31%', label: '보고서 작성 시간 절감' },
] as const

const painPoints = [
  {
    title: '데이터 분산 관리',
    description: '현장 센서, 기상 데이터, 점검 결과가 분리되어 의사결정 속도가 느려집니다.',
  },
  {
    title: '수작업 리포트',
    description: '운영 리포트를 매번 수기로 정리하느라 반복 작업이 커집니다.',
  },
  {
    title: '발전량 예측 어려움',
    description: '입지와 계절성, 설비 상태를 한 번에 비교하기 어렵습니다.',
  },
  {
    title: '사후 대응 중심 운영',
    description: '이상 징후를 조기에 발견하지 못해 장애 대응이 늦어질 수 있습니다.',
  },
] as const

const workflowSteps = [
  {
    id: '01',
    title: '입지 정보 입력',
    description: '주소, 일사량, 기상 조건을 기준으로 후보지를 정리합니다.',
  },
  {
    id: '02',
    title: '발전량 예측',
    description: 'AI 모델이 예상 발전량과 계절별 편차를 빠르게 요약합니다.',
  },
  {
    id: '03',
    title: '이상 신호 진단',
    description: '출력 저하, 장비 이상 가능성을 우선순위로 정렬합니다.',
  },
  {
    id: '04',
    title: '보고서 자동 생성',
    description: '운영팀과 고객에게 공유할 핵심 결과를 문서 형식으로 묶습니다.',
  },
] as const

const benefits = [
  { step: '01', title: '빠른 의사결정', description: '검토 시간을 줄이고 후보지 비교를 단순화합니다.' },
  { step: '02', title: '정확한 진단', description: '운영 데이터 기반으로 이상 패턴을 빠르게 확인합니다.' },
  { step: '03', title: '대시보드 연계', description: '분석 결과를 대시보드 화면으로 자연스럽게 확장할 수 있습니다.' },
  { step: '04', title: '스케일 대응', description: '여러 발전소를 동일한 구조로 운영할 수 있도록 준비합니다.' },
] as const

const footerColumns = [
  {
    title: '서비스',
    links: ['입지 분석', '발전량 예측', '운영 진단'],
  },
  {
    title: '문서',
    links: ['API 안내', '아키텍처 소개', '사용 가이드'],
  },
  {
    title: '문의',
    links: ['도입 상담', '파트너십', '기술 지원'],
  },
] as const

export function HomePage() {
  const { address, addressError, submittedAddress, handleSubmit, handleAddressChange } = useHomeForm()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.brand}>
              SolarWise
            </Link>

            <nav className={styles.nav} aria-label="홈 페이지 메뉴">
              <a href="#problems">문제 정의</a>
              <a href="#workflow">해결 구조</a>
              <a href="#benefits">기대 효과</a>
              <Link to="/dashboard">대시보드</Link>
            </nav>

            <Button type="button" className={styles.headerButton}>
              도입 문의하기
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>AI ENERGY ANALYSIS PLATFORM</span>
              <h1 className={styles.heroTitle}>AI로 태양광 발전소를 더 스마트하게 관리하세요</h1>
              <p className={styles.heroLead}>
                입지 분석부터 발전량 예측, 운영 이상 징후 진단까지 하나의 흐름으로 연결해
                실무자가 바로 판단할 수 있는 홈 화면을 구성했습니다.
              </p>

              <form className={styles.heroForm} onSubmit={handleSubmit} noValidate>
                <label htmlFor="site-address" className={styles.formLabel}>
                  발전소 주소 또는 지역명
                </label>
                <div className={styles.formRow}>
                  <input
                    id="site-address"
                    className={styles.searchInput}
                    placeholder="예: 전남 영암군 삼호읍 / 충남 서산시 대산읍"
                    value={address}
                    onChange={handleAddressChange}
                    aria-invalid={addressError ? true : undefined}
                    aria-describedby={addressError ? 'site-address-error' : undefined}
                  />
                  <Button type="submit" className={styles.primaryButton}>
                    분석 시작하기
                  </Button>
                </div>
                {addressError ? (
                  <p id="site-address-error" className={styles.error} role="alert">
                    {addressError}
                  </p>
                ) : null}
              </form>

              <div className={styles.heroActions}>
                <Button type="button" variant="secondary" className={styles.secondaryButton}>
                  빠른 견적 받기
                </Button>
                <a className={styles.inlineLink} href="#workflow">
                  분석 흐름 보기
                </a>
              </div>
            </div>

            <div className={styles.heroPreview}>
              <div className={styles.previewPanel}>
                <div className={styles.previewHeader}>
                  <span className={styles.previewBadge}>LIVE PREVIEW</span>
                  <span className={styles.previewMeta}>AI 진단 준비 완료</span>
                </div>

                <div className={styles.previewCanvas}>
                  <div className={styles.previewGlow} />
                  <div className={styles.previewMarker}>
                    <span className={styles.previewMarkerLabel}>추천 부지</span>
                    <strong>{submittedAddress || '입지를 입력하면 예측 카드가 활성화됩니다.'}</strong>
                  </div>

                  <div className={styles.previewTiles}>
                    <div className={styles.previewTile}>
                      <span>예상 발전량</span>
                      <strong>+12.8%</strong>
                    </div>
                    <div className={styles.previewTile}>
                      <span>리스크 점검</span>
                      <strong>2건 발견</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.metricsSection}>
          <div className={[styles.container, styles.metricsGrid].join(' ')}>
            {stats.map((stat) => (
              <article key={stat.label} className={styles.metricCard}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="problems" className={styles.lightSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Pain Points</span>
              <h2>기존 태양광 운영, 이런 문제 없으신가요?</h2>
              <p>현장 운영과 데이터 정리를 분리하지 않고 한 화면에서 이해할 수 있도록 구성했습니다.</p>
            </div>

            <div className={styles.issueGrid}>
              {painPoints.map((item) => (
                <article key={item.title} className={styles.issueCard}>
                  <span className={styles.issueIcon}>!</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className={styles.noticeBanner}>
              SolarWise는 주요 운영 데이터를 하나의 홈 화면에서 확인할 수 있도록 랜딩 흐름을 정리합니다.
            </div>
          </div>
        </section>

        <section id="workflow" className={styles.workflowSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>How It Works</span>
              <h2>홈 화면 중심의 분석 흐름</h2>
              <p>입력부터 예측, 진단, 보고서 생성까지 사용자가 자연스럽게 따라갈 수 있는 구조입니다.</p>
            </div>

            <div className={styles.workflowLayout}>
              <div className={styles.workflowNav}>
                {workflowSteps.map((step) => (
                  <article key={step.id} className={styles.workflowStep}>
                    <span>{step.id}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.workflowBoard}>
                <div className={styles.boardTop}>
                  <span className={styles.previewBadge}>HOME INSIGHT PANEL</span>
                  <p>최근 입력된 부지와 예측 결과를 바탕으로 추천 액션을 빠르게 보여주는 영역입니다.</p>
                </div>

                <div className={styles.boardCanvas}>
                  <div className={styles.boardHero}>
                    <strong>{submittedAddress || '입지 선택 대기 중'}</strong>
                    <span>운영팀이 즉시 확인해야 하는 인사이트를 이곳에 요약합니다.</span>
                  </div>

                  <div className={styles.boardGrid}>
                    <article>
                      <span>발전량 예측</span>
                      <strong>38.5 MWh</strong>
                    </article>
                    <article>
                      <span>일사량 지수</span>
                      <strong>우수</strong>
                    </article>
                    <article>
                      <span>설비 상태</span>
                      <strong>주의 1건</strong>
                    </article>
                    <article>
                      <span>추천 액션</span>
                      <strong>점검 일정 생성</strong>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className={styles.benefitSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Key Value</span>
              <h2>실무자가 바로 쓰는 홈 화면</h2>
              <p>시안의 카드형 구조를 현재 프론트엔드 아키텍처에 맞게 모듈화할 수 있도록 설계했습니다.</p>
            </div>

            <div className={styles.benefitGrid}>
              {benefits.map((item) => (
                <article key={item.step} className={styles.benefitCard}>
                  <span>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={[styles.container, styles.ctaInner].join(' ')}>
            <div>
              <span className={styles.sectionEyebrow}>Start with SolarWise</span>
              <h2>지금 바로 발전소 AI 진단을 준비하세요</h2>
              <p>현재 구조에서는 홈에서 관심을 모으고, 상세 진단은 대시보드로 자연스럽게 연결됩니다.</p>
            </div>

            <div className={styles.ctaActions}>
              <Button type="button" className={styles.primaryButton}>
                무료 체험 신청
              </Button>
              <Button type="button" variant="secondary" className={styles.secondaryButton}>
                서비스 더 알아보기
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={[styles.container, styles.footerInner].join(' ')}>
          <div className={styles.footerBrand}>
            <strong>SolarWise</strong>
            <p>태양광 운영 데이터를 연결하고, 실무자가 빠르게 결정하도록 돕는 프론트엔드 홈 화면입니다.</p>
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

          <form className={styles.footerForm}>
            <label htmlFor="newsletter" className={styles.formLabel}>
              뉴스레터 구독
            </label>
            <div className={styles.footerInputRow}>
              <input id="newsletter" className={styles.footerInput} placeholder="you@example.com" />
              <Button type="button" className={styles.footerButton}>
                구독하기
              </Button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  )
}
