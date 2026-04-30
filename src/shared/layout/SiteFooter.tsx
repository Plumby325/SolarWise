import styles from './SiteFooter.module.css'

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

type SiteFooterProps = {
  id?: string
}

export function SiteFooter({ id = 'resources' }: SiteFooterProps) {
  return (
    <footer id={id} className={styles.footer}>
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
        <a href="https://github.com/Plumby325/SolarWise" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  )
}
