import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './DashboardSettingsMenu.module.css'

type DashboardSettingsMenuProps = {
  placement?: 'bottom-end' | 'top-end' | 'right-end'
  variant?: 'header' | 'sidebar'
}

const settingItems = [
  { label: '계정 설정', description: '프로필과 기본 정보를 관리합니다.', to: '/settings', icon: '👤' },
  { label: '발전소 설정', description: '발전소 연동과 표시 정보를 관리합니다.', to: '/settings#plant', icon: '☀' },
  { label: '알림 설정', description: '이상 감지 알림 수신 기준을 조정합니다.', to: '/settings#notifications', icon: '🔔' },
] as const

export function DashboardSettingsMenu({
  placement = 'bottom-end',
  variant = 'header',
}: DashboardSettingsMenuProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const placementClass =
    placement === 'top-end'
      ? styles.dropdownTop
      : placement === 'right-end'
        ? styles.dropdownRight
        : styles.dropdownBottom

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [isOpen])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('solarwise-auth-change'))
    setIsOpen(false)
    navigate('/')
  }

  return (
    <div ref={rootRef} className={styles.menuRoot}>
      <button
        className={[styles.trigger, variant === 'sidebar' ? styles.triggerSidebar : ''].filter(Boolean).join(' ')}
        type="button"
        aria-label="설정"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        ⚙
      </button>

      {isOpen ? (
        <div
          className={[styles.dropdown, placementClass].join(' ')}
          role="menu"
          aria-label="설정 메뉴"
        >
          <header className={styles.dropdownHeader}>
            <strong>설정</strong>
            <span>SolarWise 관리</span>
          </header>

          <div className={styles.menuList}>
            {settingItems.map((item) => (
              <Link key={item.label} className={styles.menuItem} to={item.to} role="menuitem" onClick={() => setIsOpen(false)}>
                <span className={styles.menuIcon} aria-hidden="true">{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </Link>
            ))}
          </div>

          <button className={styles.logoutButton} type="button" role="menuitem" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  )
}
