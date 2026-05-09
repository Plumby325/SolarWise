import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnomalies, getPlants } from '@/api'
import { getSessionUser, getSessionUserDisplayName, getSessionUserRoleLabel } from '@/shared/utils/sessionUser'
import { DashboardSettingsMenu } from './DashboardSettingsMenu'
import styles from './DashboardSidebar.module.css'

type SidebarSection = 'dashboard' | 'anomaly' | 'forecast' | 'notifications'

type DashboardSidebarProps = {
  activeSection: SidebarSection
  profileActive?: boolean
}

const navItems = [
  { id: 'dashboard', label: '대시보드', icon: '⊞', to: '/dashboard' },
  { id: 'anomaly', label: '이상 감지', icon: '⚠', to: '/anomaly-detection' },
  { id: 'forecast', label: '발전량 예측', icon: '↗', to: '/power-forecast' },
  { id: 'notifications', label: '알림 설정', icon: '🔔', to: '/settings/notifications' },
] as const

export function DashboardSidebar({ activeSection, profileActive = false }: DashboardSidebarProps) {
  const currentUser = getSessionUser()
  const currentUserName = getSessionUserDisplayName(currentUser)
  const currentUserInitial = currentUserName.charAt(0)
  const [openAnomalyCount, setOpenAnomalyCount] = useState(0)
  const [plantName, setPlantName] = useState('발전소 불러오는 중')
  const [plantStatus, setPlantStatus] = useState('LOADING')

  useEffect(() => {
    let isActive = true

    const fetchOpenAnomalyCount = async () => {
      try {
        const plantResponse = await getPlants()
        const selectedPlant = plantResponse.data[0]
        const plantId = selectedPlant?.plantId

        if (!plantId) {
          if (isActive) {
            setPlantName('등록된 발전소 없음')
            setPlantStatus('INACTIVE')
            setOpenAnomalyCount(0)
          }
          return
        }

        const anomalyResponse = await getAnomalies(plantId, 50)
        const nextOpenCount = anomalyResponse.data.filter((anomaly) => anomaly.status === 'OPEN').length

        if (isActive) {
          setPlantName(selectedPlant.name)
          setPlantStatus(selectedPlant.status)
          setOpenAnomalyCount(nextOpenCount)
        }
      } catch {
        if (isActive) {
          setPlantName('발전소 조회 실패')
          setPlantStatus('ERROR')
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
          <strong>{plantName}</strong>
          <small>● {plantStatus}</small>
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
            isActive && activeSection === 'notifications' ? styles.navItemActiveGreen : '',
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

      <section className={[styles.profile, profileActive ? styles.profileActive : ''].filter(Boolean).join(' ')} aria-label="사용자 정보">
        <span className={styles.avatar}>{currentUserInitial}</span>
        <span>
          <strong>{currentUserName}</strong>
          <small>{getSessionUserRoleLabel(currentUser.role)}</small>
        </span>
        <DashboardSettingsMenu placement="right-end" variant="sidebar" />
      </section>
    </aside>
  )
}
