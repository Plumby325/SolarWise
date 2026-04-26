import { Link } from 'react-router-dom'
import { useHideOnScroll } from '@/shared/hooks/useHideOnScroll'
import styles from './AboutPage.module.css'

const valueCards = [
  {
    icon: '🔮',
    title: 'AI 예지 정비',
    description: ['고장 발생 전 징후를 사전에', '포착하여 피해를 막습니다.'],
    tone: 'blue',
  },
  {
    icon: '🧠',
    title: '투명한 XAI',
    description: ['AI가 왜 그런 판단을 내렸는지', '사용자 언어로 설명합니다.'],
    tone: 'green',
  },
  {
    icon: '👤',
    title: '비전문가 친화',
    description: ['소규모 발전소 운영자도', '쉽게 사용할 수 있습니다.'],
    tone: 'orange',
  },
] as const

const teamMembers = [
  { name: '윤의규', major: '컴퓨터공학', role: 'Frontend', tone: 'blue' },
  { name: '황민지', major: '인공지능', role: 'AI', tone: 'green' },
  { name: '이강민', major: '컴퓨터공학', role: 'Frontend', tone: 'blue' },
  { name: '이승윤', major: '컴퓨터공학', role: 'Backend', tone: 'orange' },
  { name: '강지은', major: '응용통계학', role: 'Frontend', tone: 'blue' },
  { name: '박채리', major: 'SW안전보안', role: 'Backend', tone: 'orange' },
  { name: '윤소윤', major: '인공지능', role: 'AI', tone: 'green' },
] as const

const problemItems = [
  '대부분의 모니터링 시스템은 대규모 발전소 기업용',
  '소규모 운영자에게 최적화된 서비스 부재',
  '고장 발생 후 대응하는 사후 정비 체계',
  'AI 판단 근거를 설명하지 않는 블랙박스 문제',
] as const

const solutionItems = [
  'Transformer AI — 향후 2~3일 발전량 정밀 예측',
  'Vision AI — 크랙·먼지·눈 오염 자동 감지',
  'XAI — AI 판단 근거를 비전문가 언어로 설명',
  '예지 정비 — 고장 전 사전 포착 및 알림',
] as const

const backgroundStats = [
  { value: '55%', label: '태양광 신재생에너지 비중 (2024)', tone: 'blue' },
  { value: '93.8%', label: '신재생 신규 설비 중 태양광', tone: 'green' },
  { value: '100kW↓', label: '소규모 발전소 타겟', tone: 'orange' },
] as const

const techStacks = [
  { title: 'Frontend', icon: '⚛', tone: 'blue', items: ['React', 'Figma'] },
  { title: 'Backend', icon: '🍃', tone: 'green', items: ['Spring Boot', 'MySQL'] },
  { title: 'AI', icon: '🤖', tone: 'orange', items: ['PyTorch', 'OpenCV', 'XAI'] },
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

const heroMeta = [
  { label: '팀명', value: '솔라와이즈' },
  { label: '협력기업', value: '지케스' },
  { label: '팀원', value: '7명' },
] as const

export function AboutPage() {
  const isHeaderHidden = useHideOnScroll()

  return (
    <div className={styles.page}>
      <header className={[styles.header, 'gnb-scroll-header', isHeaderHidden ? 'gnb-scroll-header--hidden' : ''].filter(Boolean).join(' ')}>
        <div className={styles.container}>
          <div className={styles.headerInner}>
            <Link to="/" className={styles.logo} aria-label="SolarWise 홈">
              <span className={styles.logoDot} />
              <span className={styles.logoPrimary}>Solar</span>
              <span className={styles.logoAccent}>Wise</span>
            </Link>

            <nav className={styles.nav} aria-label="About 페이지 메뉴">
              <Link to="/services">서비스 소개</Link>
              <Link to="/dashboard">대시보드</Link>
              <a href="#footer">리소스</a>
              <Link to="/about" className={styles.navActive}>
                팀 소개
              </Link>
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
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} aria-hidden="true" />
              AI컴퓨터공학부 심화캡스톤디자인 · 협력기업: 지케스
            </div>

            <h1 className={styles.heroTitle}>
              <span>AI로 소규모 발전소를 지키는 팀,</span>
              <span className={styles.heroTitleAccent}>솔라와이즈</span>
            </h1>

            <p className={styles.heroDescription}>
              소규모 태양광 발전소 운영자를 위한
              <br />
              AI 기반 통합 관리 플랫폼을 만듭니다.
            </p>

            <div className={styles.heroMeta}>
              {heroMeta.map((item) => (
                <article key={item.label} className={styles.heroMetaCard}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.valueSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>ABOUT</span>
              <h2>우리가 만드는 것</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
              <p>
                소규모 태양광 발전소 운영자가 AI를 통해 발전소를 실시간으로
                <br />
                모니터링하고 예지 정비할 수 있는 플랫폼
              </p>
            </div>

            <div className={styles.valueGrid}>
              {valueCards.map((card) => (
                <article
                  key={card.title}
                  className={[
                    styles.valueCard,
                    card.tone === 'green' ? styles.valueCardGreen : '',
                    card.tone === 'orange' ? styles.valueCardOrange : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.valueIconWrap} aria-hidden="true">
                    <span className={styles.valueIcon}>{card.icon}</span>
                  </span>
                  <h3>{card.title}</h3>
                  <p>
                    {card.description[0]}
                    <br />
                    {card.description[1]}
                  </p>
                </article>
              ))}
            </div>

            <div className={styles.partnerBanner}>
              <span>협력기업</span>
              <strong>지케스 · 어플리케이션SW</strong>
            </div>
          </div>
        </section>

        <section className={styles.teamSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>TEAM</span>
              <h2>팀원 소개</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
            </div>

            <div className={styles.teamGrid}>
              {teamMembers.map((member) => (
                <article
                  key={member.name}
                  className={[
                    styles.memberCard,
                    member.tone === 'green' ? styles.memberCardGreen : '',
                    member.tone === 'orange' ? styles.memberCardOrange : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={[
                      styles.avatar,
                      member.tone === 'green' ? styles.avatarGreen : '',
                      member.tone === 'orange' ? styles.avatarOrange : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                  <h3>{member.name}</h3>
                  <p>{member.major}</p>
                  <span
                    className={[
                      styles.roleBadge,
                      member.tone === 'green' ? styles.roleBadgeGreen : '',
                      member.tone === 'orange' ? styles.roleBadgeOrange : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {member.role}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.backgroundSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>BACKGROUND</span>
              <h2>왜 만들었나요?</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
            </div>

            <div className={styles.backgroundGrid}>
              <article className={[styles.backgroundCard, styles.problemCard].join(' ')}>
                <div className={styles.backgroundHeader}>
                  <span aria-hidden="true">❌</span>
                  <h3>기존 시스템의 문제</h3>
                </div>
                <ul>
                  {problemItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className={[styles.backgroundCard, styles.solutionCard].join(' ')}>
                <div className={styles.backgroundHeader}>
                  <span aria-hidden="true">✅</span>
                  <h3>솔라와이즈의 해결책</h3>
                </div>
                <ul>
                  {solutionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className={styles.statGrid}>
              {backgroundStats.map((stat) => (
                <article
                  key={stat.label}
                  className={[
                    styles.statCard,
                    stat.tone === 'green' ? styles.statCardGreen : '',
                    stat.tone === 'orange' ? styles.statCardOrange : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.stackSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.eyebrow}>TECH STACK</span>
              <h2>기술 스택</h2>
              <div className={styles.sectionBar} aria-hidden="true" />
            </div>

            <div className={styles.stackGrid}>
              {techStacks.map((stack) => (
                <article
                  key={stack.title}
                  className={[
                    styles.stackCard,
                    stack.tone === 'green' ? styles.stackCardGreen : '',
                    stack.tone === 'orange' ? styles.stackCardOrange : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.stackIconWrap} aria-hidden="true">
                    <span className={styles.stackIcon}>{stack.icon}</span>
                  </span>
                  <h3>{stack.title}</h3>
                  <div className={styles.stackItems}>
                    {stack.items.map((item) => (
                      <div key={item} className={styles.stackItem}>
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={[styles.container, styles.ctaInner].join(' ')}>
            <h2>SolarWise를 직접 경험해보세요</h2>
            <p>소규모 발전소 운영자를 위한 AI 통합 관리 플랫폼</p>
            <div className={styles.ctaActions}>
              <Link to="/signup" className={styles.primaryButton}>
                서비스 시작하기
              </Link>
              <Link to="/services" className={styles.secondaryButton}>
                서비스 소개 보기
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
