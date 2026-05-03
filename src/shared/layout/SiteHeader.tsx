import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHideOnScroll } from '@/shared/hooks/useHideOnScroll'
import styles from './SiteHeader.module.css'

type ActiveNav = 'services' | 'about' | 'login' | 'signup'

type SiteHeaderProps = {
  active?: ActiveNav
  ariaLabel?: string
}

type StoredUser = {
  name?: unknown
  email?: unknown
}

function getStoredUserName() {
  const storedUser = localStorage.getItem('user')

  if (!storedUser || !localStorage.getItem('accessToken')) {
    return ''
  }

  try {
    const user = JSON.parse(storedUser) as StoredUser
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    const email = typeof user.email === 'string' ? user.email.trim() : ''

    return name || email
  } catch {
    return ''
  }
}

export function SiteHeader({ active, ariaLabel = '주요 메뉴' }: SiteHeaderProps) {
  const isHeaderHidden = useHideOnScroll()
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const syncAuthState = () => {
      setUserName(getStoredUserName())
    }

    syncAuthState()
    window.addEventListener('storage', syncAuthState)
    window.addEventListener('solarwise-auth-change', syncAuthState)

    return () => {
      window.removeEventListener('storage', syncAuthState)
      window.removeEventListener('solarwise-auth-change', syncAuthState)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('solarwise-auth-change'))
    navigate('/')
  }

  return (
    <header className={[styles.header, 'gnb-scroll-header', isHeaderHidden ? 'gnb-scroll-header--hidden' : ''].filter(Boolean).join(' ')}>
      <div className={styles.container}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="SolarWise 홈">
            <span className={styles.brandSun} />
            <span className={styles.brandTextPrimary}>Solar</span>
            <span className={styles.brandTextAccent}>Wise</span>
          </Link>

          <nav className={styles.nav} aria-label={ariaLabel}>
            <Link to="/services" className={active === 'services' ? styles.navActive : undefined}>
              서비스 소개
            </Link>
            <Link to="/dashboard">대시보드</Link>
            <Link to="/#resources">리소스</Link>
            <Link to="/about" className={active === 'about' ? styles.navActive : undefined}>
              팀 소개
            </Link>
          </nav>

          <div className={styles.headerActions}>
            {userName ? (
              <span className={styles.userName}>{userName} 관리자님</span>
            ) : (
              <>
                {active === 'login' ? (
                  <span className={styles.activeLink}>로그인</span>
                ) : (
                  <Link to="/login" className={styles.loginLink}>
                    로그인
                  </Link>
                )}
              </>
            )}

            {userName ? (
              <button type="button" className={styles.headerButton} onClick={handleLogout}>
                로그아웃
              </button>
            ) : (
              <>
                {active === 'signup' ? (
                  <span className={styles.headerButton}>회원가입</span>
                ) : (
                  <Link to="/signup" className={styles.headerButton}>
                    회원가입
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
