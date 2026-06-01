import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAnomalies,
  getPlants,
  getPlaybackStatus,
  startPlayback,
  stopPlayback,
  triggerPowerAnomaly,
} from '@/api'
import { getSessionUser, getSessionUserDisplayName, getSessionUserRoleLabel } from '@/shared/utils/sessionUser'
import { DashboardSettingsMenu } from './DashboardSettingsMenu'
import styles from './DashboardSidebar.module.css'

export const SIMULATION_CHANGE_EVENT = 'solarwise-simulation-change'

export function notifySimulationChange() {
  window.dispatchEvent(new Event(SIMULATION_CHANGE_EVENT))
}

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
  const [plantId, setPlantId] = useState<number | null>(null)
  const [playbackRunning, setPlaybackRunning] = useState(false)
  const [simulationBusy, setSimulationBusy] = useState(false)
  const [simulationError, setSimulationError] = useState('')
  const isAdmin = getSessionUser().role === 'ADMIN'

  useEffect(() => {
    let isActive = true

    const fetchOpenAnomalyCount = async () => {
      try {
        const plantResponse = await getPlants()
        const selectedPlant = plantResponse.data[0]
        const selectedPlantId = selectedPlant?.plantId

        if (!selectedPlantId) {
          if (isActive) {
            setPlantId(null)
            setPlantName('등록된 발전소 없음')
            setPlantStatus('INACTIVE')
            setOpenAnomalyCount(0)
          }
          return
        }

        const [anomalyResponse, playbackResponse] = await Promise.all([
          getAnomalies(selectedPlantId, 50),
          getPlaybackStatus(),
        ])
        const nextOpenCount = anomalyResponse.data.filter((anomaly) => anomaly.status === 'OPEN').length

        if (isActive) {
          setPlantId(selectedPlantId)
          setPlantName(selectedPlant.name)
          setPlantStatus(selectedPlant.status)
          setOpenAnomalyCount(nextOpenCount)
          setPlaybackRunning(playbackResponse.data.running)
        }
      } catch {
        if (isActive) {
          setPlantId(null)
          setPlantName('발전소 조회 실패')
          setPlantStatus('ERROR')
          setOpenAnomalyCount(0)
          setPlaybackRunning(false)
        }
      }
    }

    fetchOpenAnomalyCount()
    const pollingTimer = window.setInterval(fetchOpenAnomalyCount, playbackRunning ? 1000 : 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [playbackRunning])

  const handleSimulationAction = useCallback(async () => {
    if (!isAdmin) {
      setSimulationError('시뮬레이션 제어는 ADMIN 계정만 가능합니다.')
      return
    }

    if (!plantId) {
      setSimulationError('연결된 발전소가 없습니다.')
      return
    }

    setSimulationBusy(true)
    setSimulationError('')

    try {
      if (!playbackRunning) {
        const startResponse = await startPlayback()
        setPlaybackRunning(startResponse.data.running)
        notifySimulationChange()
        return
      }

      await triggerPowerAnomaly({
        plantId,
        anomalySeverity: 'HIGH',
        differencePercentage: 40,
        durationHours: 2,
        description: '시연용 미래 구간 발전량 저하',
      })
      notifySimulationChange()
    } catch (error) {
      setSimulationError(error instanceof Error ? error.message : '시뮬레이션 API 호출 실패')
    } finally {
      setSimulationBusy(false)
    }
  }, [isAdmin, plantId, playbackRunning])

  const handleStopSimulation = useCallback(async () => {
    if (!isAdmin || !playbackRunning) {
      return
    }

    setSimulationBusy(true)
    setSimulationError('')

    try {
      const stopResponse = await stopPlayback()
      setPlaybackRunning(stopResponse.data.running)
      notifySimulationChange()
    } catch (error) {
      setSimulationError(error instanceof Error ? error.message : '시뮬레이션 정지 실패')
    } finally {
      setSimulationBusy(false)
    }
  }, [isAdmin, playbackRunning])

  const simulationButtonLabel = playbackRunning ? '이상 감지 트리거' : '시뮬레이션 시작'

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

      <div className={styles.sidebarFooter}>
        <div className={styles.simulationActionWrap}>
          <button
            type="button"
            className={[
              styles.anomalyActionButton,
              playbackRunning ? styles.anomalyActionButtonRunning : '',
              !isAdmin ? styles.anomalyActionButtonDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={simulationBusy || !isAdmin || !plantId}
            aria-label={
              !isAdmin
                ? '시뮬레이션 제어 (ADMIN 전용)'
                : playbackRunning
                  ? '가상 시간 재생 중 · POWER 이상 감지 트리거'
                  : '가상 시간 시뮬레이션 재생 시작'
            }
            onClick={() => void handleSimulationAction()}
          >
            <span className={styles.anomalyActionIcon} aria-hidden="true">
              {playbackRunning ? '⚡' : '▶'}
            </span>
            <span>{simulationButtonLabel}</span>
            {openAnomalyCount > 0 ? (
              <strong className={styles.anomalyActionBadge}>{openAnomalyCount}</strong>
            ) : null}
          </button>
          {playbackRunning ? (
            <button
              type="button"
              className={styles.simulationStopButton}
              disabled={simulationBusy || !isAdmin}
              onClick={() => void handleStopSimulation()}
            >
              재생 정지
            </button>
          ) : null}
          {simulationError ? <p className={styles.simulationError}>{simulationError}</p> : null}
        </div>

        <section className={[styles.profile, profileActive ? styles.profileActive : ''].filter(Boolean).join(' ')} aria-label="사용자 정보">
          <span className={styles.avatar}>{currentUserInitial}</span>
          <span>
            <strong>{currentUserName}</strong>
            <small>{getSessionUserRoleLabel(currentUser.role)}</small>
          </span>
          <DashboardSettingsMenu placement="right-end" variant="sidebar" />
        </section>
      </div>
    </aside>
  )
}
