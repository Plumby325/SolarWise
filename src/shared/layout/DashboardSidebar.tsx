import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnomalies, getPlants } from '@/api'
import { DashboardSettingsMenu } from './DashboardSettingsMenu'
import styles from './DashboardSidebar.module.css'

type SidebarSection = 'dashboard' | 'anomaly' | 'forecast'

type DashboardSidebarProps = {
  activeSection: SidebarSection
}

const navItems = [
  { id: 'dashboard', label: '대시보드', icon: '⊞', to: '/dashboard' },
  { id: 'anomaly', label: '이상 감지', icon: '⚠', to: '/anomaly-detection' },
  { id: 'forecast', label: '발전량 예측', icon: '↗', to: '/power-forecast' },
  { id: 'notifications', label: '알림 설정', icon: '🔔', to: '#notifications' },
] as const

function getStoredUserName() {
  const fallbackName = '사용자'
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return fallbackName
  }

  try {
    const user = JSON.parse(storedUser) as { name?: unknown; email?: unknown }
    const name = typeof user.name === 'string' ? user.name.trim() : ''
    const email = typeof user.email === 'string' ? user.email.trim() : ''

    return name || email || fallbackName
  } catch {
    return fallbackName
  }
}

export function DashboardSidebar({ activeSection }: DashboardSidebarProps) {
  const currentUserName = getStoredUserName()
  const currentUserInitial = currentUserName.charAt(0)
  const [openAnomalyCount, setOpenAnomalyCount] = useState(0)

  useEffect(() => {
    let isActive = true

    const fetchOpenAnomalyCount = async () => {
      try {
        const plantResponse = await getPlants()
        const plantId = plantResponse.data[0]?.plantId

        if (!plantId) {
          if (isActive) {
            setOpenAnomalyCount(0)
          }
          return
        }

        const anomalyResponse = await getAnomalies(plantId, 50)
        const nextOpenCount = anomalyResponse.data.filter((anomaly) => anomaly.status === 'OPEN').length

        if (isActive) {
          setOpenAnomalyCount(nextOpenCount)
        }
      } catch {
        if (isActive) {
          setOpenAnomalyCount(0)
        }
      }
    }

    fetchOpenAnomalyCount()
    const pollingTimer = window.setInterval(fetchOpenAnomalyCount, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [])

  return (
    <aside className={styles.sidebar} aria-label="대시보드 사이드바">
      <Link className={styles.brand} to="/" aria-label="SolarWise 홈으로 이동">
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandSolar}>Solar</span>
        <span className={styles.brandWise}>Wise</span>
      </Link>

      <button className={styles.plantSelector} type="button">
        <span className={styles.plantAccent} aria-hidden="true" />
        <span>
          <strong>전북 익산 1호 발전소</strong>
          <small>● ACTIVE</small>
        </span>
        <span className={styles.chevron} aria-hidden="true">⌄</span>
      </button>

      <nav className={styles.navMenu} aria-label="대시보드 메뉴">
        {navItems.map((item) => {
          const isActive = item.id === activeSection
          const badge = item.id === 'anomaly' && openAnomalyCount > 0 ? String(openAnomalyCount) : ''
          const className = [
            styles.navItem,
            isActive ? styles.navItemActive : '',
            isActive && activeSection === 'anomaly' && openAnomalyCount > 0 ? styles.navItemActiveRed : '',
            item.id === 'anomaly' && openAnomalyCount > 0 ? styles.navItemAlert : '',
          ]
            .filter(Boolean)
            .join(' ')

          return item.to.startsWith('/') ? (
            <Link key={item.id} className={className} to={item.to}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {badge ? <strong className={styles.navBadge}>{badge}</strong> : null}
            </Link>
          ) : (
            <a key={item.id} className={className} href={item.to}>
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <section className={styles.profile} aria-label="사용자 정보">
        <span className={styles.avatar}>{currentUserInitial}</span>
        <span>
          <strong>{currentUserName}</strong>
          <small>발전소 관리자</small>
        </span>
        <DashboardSettingsMenu placement="right-end" variant="sidebar" />
      </section>
    </aside>
  )
}
