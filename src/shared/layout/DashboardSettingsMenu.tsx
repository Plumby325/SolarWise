import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuthSession, getSessionUser, getSessionUserRoleLabel } from '@/shared/utils/sessionUser'
import styles from './DashboardSettingsMenu.module.css'

type DashboardSettingsMenuProps = {
  placement?: 'bottom-end' | 'top-end' | 'right-end'
  variant?: 'header' | 'sidebar'
}

const settingItems = [
  { label: '내 프로필', description: '계정 정보 관리', to: '/settings/profile', icon: '👤' },
  { label: '알림 설정', description: '이메일 알림 관리', to: '/settings/notifications', icon: '🔔' },
  { label: '발전소 설정', description: '발전소 목록·상세 관리', to: '/settings/plant', icon: '🏭' },
] as const

export function DashboardSettingsMenu({
  placement = 'bottom-end',
  variant = 'header',
}: DashboardSettingsMenuProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const currentUser = getSessionUser()
  const userInitial = currentUser.name.charAt(0)
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
    clearAuthSession()
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
          <header className={styles.accountHeader}>
            <span className={styles.accountAvatar}>{userInitial}</span>
            <span className={styles.accountCopy}>
              <strong>{currentUser.name}</strong>
              <small>{getSessionUserRoleLabel(currentUser.role)}</small>
              <em>{currentUser.email}</em>
            </span>
          </header>

          <div className={styles.menuList}>
            {settingItems.map((item) => (
              <Link key={item.label} className={styles.menuItem} to={item.to} role="menuitem" onClick={() => setIsOpen(false)}>
                <span className={styles.menuIcon} aria-hidden="true">{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <span className={styles.menuChevron} aria-hidden="true">›</span>
              </Link>
            ))}
          </div>

          <div className={styles.menuDivider} />

          <Link className={styles.helpItem} to="/settings#help" role="menuitem" onClick={() => setIsOpen(false)}>
            <span className={styles.menuIcon} aria-hidden="true">?</span>
            <strong>도움말</strong>
          </Link>

          <button className={styles.logoutButton} type="button" role="menuitem" onClick={handleLogout}>
            <span aria-hidden="true">🚪</span>
            <strong>로그아웃</strong>
          </button>

          <footer className={styles.menuFooter}>SolarWise v1.0.0</footer>
        </div>
      ) : null}
    </div>
  )
}
