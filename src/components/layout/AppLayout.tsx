import { NavLink, Outlet } from 'react-router-dom'
import styles from './AppLayout.module.css'

const navItems = [
  { to: '/', label: '홈', end: true },
  { to: '/dashboard', label: '대시보드' },
  { to: '/settings', label: '설정' },
] as const

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>SolarWise</span>
          <nav className={styles.headerNav} aria-label="주요 메뉴">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="사이드 내비게이션">
          <nav className={styles.sidebarNav}>
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [styles.sideLink, isActive ? styles.sideLinkActive : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>SolarWise · 프론트엔드 개발 중</p>
      </footer>
    </div>
  )
}
