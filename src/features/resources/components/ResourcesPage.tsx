import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '@/shared/layout/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './ResourcesPage.module.css'

type ContentFilter = 'all' | 'blog' | 'faq' | 'case'

const popularTerms = ['발전량 예측', '패널 청소', '이상 감지', 'XAI 설명', '센서 연동'] as const

const quickStartCards = [
  {
    step: '01',
    stepBadgeClass: styles.quickBadgeBlue,
    chip: '초보자 필독',
    chipClass: styles.quickChipBlue,
    accentClass: styles.quickAccentBlue,
    icon: '▶',
    iconClass: styles.quickIconBlue,
    title: '서비스 시작하기',
    lines: ['회원가입부터 발전소 등록,', '센서 연동까지 단계별로 안내합니다.'],
    linkClass: styles.quickLinkBlue,
    href: '/resources/service-start',
  },
  {
    step: '02',
    stepBadgeClass: styles.quickBadgeGreen,
    chip: '핵심 기능',
    chipClass: styles.quickChipGreen,
    accentClass: styles.quickAccentGreen,
    icon: '◈',
    iconClass: styles.quickIconGreen,
    title: '대시보드 100% 활용',
    lines: ['실시간 차트, 이상 감지,', 'AI 예측 기능을 완전 정복합니다.'],
    linkClass: styles.quickLinkGreen,
    href: '/resources/dashboard-guide',
  },
  {
    step: '03',
    stepBadgeClass: styles.quickBadgeOrange,
    chip: 'XAI 입문',
    chipClass: styles.quickChipOrange,
    accentClass: styles.quickAccentOrange,
    icon: '★',
    iconClass: styles.quickIconOrange,
    title: 'AI가 뭘 설명하는 건가요?',
    lines: ['SHAP, Grad-CAM 등 AI 용어를', '비전문가 언어로 쉽게 설명합니다.'],
    linkClass: styles.quickLinkOrange,
    href: '/services',
  },
] as const

const resourceArticles = [
  {
    id: 'panel-soil',
    filter: 'blog' as const,
    topClass: styles.cardTopBlue,
    tagClass: styles.articleTagBlog,
    tagLabel: '블로그',
    hot: true,
    title: '패널 오염이 발전량에 미치는 영향',
    excerpt: '먼지·눈·새 배설물이 발전량을 최대 30% 낮출 수 있습니다. 정기 청소 주기와 청소 효과를 데이터로 확인하세요.',
    readLabel: '⏱ 5분 읽기',
    dateLabel: '2026.04.10',
    linkClass: styles.moreLinkBlue,
  },
  {
    id: 'xgboost',
    filter: 'blog' as const,
    topClass: styles.cardTopBlue,
    tagClass: styles.articleTagBlog,
    tagLabel: '블로그',
    hot: false,
    title: 'XGBoost가 발전량을 예측하는 방법',
    excerpt: '기상 데이터와 과거 패턴을 결합해 2~3일 앞을 내다보는 AI 예측 모델의 원리를 쉽게 설명합니다.',
    readLabel: '⏱ 7분 읽기',
    dateLabel: '2026.04.05',
    linkClass: styles.moreLinkBlue,
  },
  {
    id: 'gradcam',
    filter: 'blog' as const,
    topClass: styles.cardTopBlue,
    tagClass: styles.articleTagBlog,
    tagLabel: '블로그',
    hot: false,
    title: 'Grad-CAM 히트맵이란 무엇인가요?',
    excerpt: 'AI가 패널의 어느 부위를 이상으로 판단했는지 시각적으로 보여주는 Grad-CAM 기술을 소개합니다.',
    readLabel: '⏱ 6분 읽기',
    dateLabel: '2026.03.28',
    linkClass: styles.moreLinkBlue,
  },
  {
    id: 'anomaly-accuracy',
    filter: 'faq' as const,
    topClass: styles.cardTopOrange,
    tagClass: styles.articleTagFaq,
    tagLabel: 'FAQ',
    hot: false,
    title: '이상 감지는 얼마나 정확한가요?',
    excerpt: 'YOLOv11s 모델은 테스트 데이터셋 기준 93% 이상의 신뢰도로 패널 결함을 감지합니다.',
    readLabel: '⏱ 2분 읽기',
    dateLabel: '상시',
    linkClass: styles.moreLinkOrange,
  },
  {
    id: 'iksan-case',
    filter: 'case' as const,
    topClass: styles.cardTopGreen,
    tagClass: styles.articleTagCase,
    tagLabel: '케이스 스터디',
    hot: true,
    title: '전북 익산 농가, 발전 효율 23% 향상',
    excerpt: 'SolarWise 도입 후 6개월간의 실제 데이터입니다. AI 예지 정비로 고장 발생 전 선제 대응에 성공했습니다.',
    readLabel: '⏱ 10분 읽기',
    dateLabel: '2026.03.15',
    linkClass: styles.moreLinkGreen,
  },
  {
    id: 'no-sensor',
    filter: 'faq' as const,
    topClass: styles.cardTopOrange,
    tagClass: styles.articleTagFaq,
    tagLabel: 'FAQ',
    hot: false,
    title: '센서가 없어도 사용할 수 있나요?',
    excerpt: '인버터 데이터만으로도 기본적인 발전량 모니터링이 가능합니다. 센서 연동 시 더 정밀한 분석이 제공됩니다.',
    readLabel: '⏱ 2분 읽기',
    dateLabel: '상시',
    linkClass: styles.moreLinkOrange,
  },
] as const

function normalizeSearch(s: string) {
  return s.trim().toLowerCase()
}

function matchesArticle(
  article: (typeof resourceArticles)[number],
  q: string,
  filter: ContentFilter,
): boolean {
  if (filter !== 'all' && article.filter !== filter) return false
  if (!q) return true
  const hay = `${article.title} ${article.excerpt} ${article.tagLabel}`.toLowerCase()
  return hay.includes(q)
}

export function ResourcesPage() {
  const [filter, setFilter] = useState<ContentFilter>('all')
  const [queryInput, setQueryInput] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')

  const filteredArticles = useMemo(() => {
    const q = normalizeSearch(appliedQuery)
    return resourceArticles.filter((article) => matchesArticle(article, q, filter))
  }, [appliedQuery, filter])

  const runSearch = () => setAppliedQuery(queryInput.trim())

  const applyPopularTerm = (term: string) => {
    setQueryInput(term)
    setAppliedQuery(term)
  }

  return (
    <div className={styles.page}>
      <SiteHeader active="resources" ariaLabel="리소스 페이지 메뉴" />

      <main>
        <section className={styles.hero} aria-labelledby="resources-hero-title">
          <div className={styles.heroGlowRight} aria-hidden="true" />
          <div className={styles.heroGlowLeft} aria-hidden="true" />
          <div className={styles.heroLines} aria-hidden="true" />

          <div className={[styles.container, styles.heroInner].join(' ')}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} aria-hidden="true" />
              발전소 운영에 필요한 모든 정보
            </div>

            <h1 id="resources-hero-title" className={styles.heroTitle}>
              <span className={styles.heroTitleWhite}>모르는 게 있으신가요?</span>
              <span className={styles.heroTitleAccent}>SolarWise가 도와드릴게요.</span>
            </h1>

            <p className={styles.heroLead}>사용 가이드부터 AI 발전량 예측 원리까지 — 쉽게 설명해드립니다.</p>

            <div className={styles.searchRow}>
              <label className={styles.searchField}>
                <span className={styles.searchIcon} aria-hidden="true">
                  🔍
                </span>
                <input
                  type="search"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runSearch()
                  }}
                  placeholder="궁금한 내용을 검색해보세요 (예: 이상 감지, SHAP, 패널 청소)"
                  className={styles.searchInput}
                  aria-label="리소스 검색"
                />
              </label>
              <button type="button" className={styles.searchButton} onClick={runSearch}>
                검색
              </button>
            </div>

            <div className={styles.popularRow}>
              <span className={styles.popularLabel}>인기 검색어:</span>
              <div className={styles.popularChips}>
                {popularTerms.map((term) => (
                  <button key={term} type="button" className={styles.popularChip} onClick={() => applyPopularTerm(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.quickSection} aria-labelledby="quick-heading">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>QUICK START</span>
              <h2 id="quick-heading">3분이면 충분해요</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
            </div>

            <div className={styles.quickGrid}>
              {quickStartCards.map((card) => (
                <article key={card.step} className={styles.quickCard}>
                  <div className={[styles.quickCardAccent, card.accentClass].join(' ')} aria-hidden="true" />
                  <div className={styles.quickCardInner}>
                    <div className={styles.quickTopRow}>
                      <span className={[styles.quickStepBadge, card.stepBadgeClass].join(' ')}>{card.step}</span>
                      <span className={[styles.quickChip, card.chipClass].join(' ')}>{card.chip}</span>
                    </div>
                    <span className={[styles.quickGlyph, card.iconClass].join(' ')} aria-hidden="true">
                      {card.icon}
                    </span>
                    <h3 className={styles.quickTitle}>{card.title}</h3>
                    <p className={styles.quickDesc}>
                      {card.lines[0]}
                      <br />
                      {card.lines[1]}
                    </p>
                    <div className={styles.quickDivider} aria-hidden="true" />
                    <Link className={[styles.quickReadMore, card.linkClass].join(' ')} to={card.href}>
                      읽어보기 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="library" className={styles.librarySection} aria-labelledby="library-heading">
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>RESOURCES</span>
              <h2 id="library-heading">인기 콘텐츠</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
            </div>

            <div className={styles.filterRow} role="tablist" aria-label="콘텐츠 유형">
              {(
                [
                  { id: 'all' as const, label: '전체' },
                  { id: 'blog' as const, label: '블로그' },
                  { id: 'faq' as const, label: 'FAQ' },
                  { id: 'case' as const, label: '케이스 스터디' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  className={[styles.filterPill, filter === id ? styles.filterPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredArticles.length === 0 ? (
              <p className={styles.emptyState} role="status">
                검색 결과가 없습니다. 다른 키워드나 필터를 선택해 보세요.
              </p>
            ) : (
              <div className={styles.articleGrid}>
                {filteredArticles.map((article) => (
                  <article key={article.id} className={styles.articleCard}>
                    <div className={[styles.articleTopBar, article.topClass].join(' ')} aria-hidden="true" />
                    <div className={styles.articleBody}>
                      <div className={styles.articleTags}>
                        <span className={article.tagClass}>{article.tagLabel}</span>
                        {article.hot ? <span className={styles.hotBadge}>HOT</span> : null}
                      </div>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleExcerpt}>{article.excerpt}</p>
                      <div className={styles.articleDivider} aria-hidden="true" />
                      <div className={styles.articleMeta}>
                        <span>{article.readLabel}</span>
                        <span>{article.dateLabel}</span>
                      </div>
                      <button type="button" className={[styles.articleMore, article.linkClass].join(' ')}>
                        더 읽기 →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.newsletterSection} aria-labelledby="newsletter-heading">
          <div className={styles.newsletterGlowR} aria-hidden="true" />
          <div className={styles.newsletterGlowL} aria-hidden="true" />
          <div className={[styles.container, styles.newsletterInner].join(' ')}>
            <h2 id="newsletter-heading" className={styles.newsletterTitle}>
              발전소 운영 인사이트, 놓치지 마세요
            </h2>
            <p className={styles.newsletterLead}>월 1회 · AI 발전량 트렌드 · 유지보수 팁 · 제도 변화 소식</p>
            <form
              className={styles.newsletterForm}
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <input type="email" className={styles.newsletterInput} placeholder="이메일 주소를 입력하세요" aria-label="뉴스레터 이메일" />
              <button type="submit" className={styles.newsletterSubmit}>
                구독하기
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter id="footer" />
    </div>
  )
}
