import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnomalies, getDashboardSummary } from '@/api'
import type { AnomalyEvent, DashboardSummary, Plant } from '@/api'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { BackNavLink } from '@/shared/ui/BackNavLink'
import {
  type ClientRegisteredPlant,
  type NewPlantPayload,
  isClientRegisteredPlant,
  loadClientPlants,
  saveClientPlants,
} from '@/shared/utils/localClientPlants'
import { formatKoreanDateTime, formatKoreanSignupYmd } from '@/shared/utils/dateFormat'
import { getSessionUser } from '@/shared/utils/sessionUser'
import { PlantRegisterModal } from './PlantRegisterModal'
import styles from './PlantSettingsPage.module.css'

function formatPlantId(plantId: number) {
  return `#${plantId}`
}

function isActiveStatus(status: string) {
  return status.toUpperCase() === 'ACTIVE'
}

export function PlantSettingsPage() {
  const sessionUser = getSessionUser()
  const { plants, isLoading, errorMessage } = useDefaultPlant()
  const plantsRef = useRef(plants)
  const [localPlants, setLocalPlants] = useState<ClientRegisteredPlant[]>(() => loadClientPlants(sessionUser.userId))

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [registerToast, setRegisterToast] = useState<string | null>(null)

  plantsRef.current = plants

  const allPlants = useMemo(() => [...localPlants, ...plants], [localPlants, plants])

  useEffect(() => {
    saveClientPlants(sessionUser.userId, localPlants)
  }, [localPlants, sessionUser.userId])

  useEffect(() => {
    if (!allPlants.length) {
      setSelectedId(null)
      return
    }
    setSelectedId((prev) => {
      if (prev && allPlants.some((p) => p.plantId === prev)) {
        return prev
      }
      return allPlants[0].plantId
    })
  }, [allPlants])

  useEffect(() => {
    if (!selectedId) {
      setSummary(null)
      setAnomalies([])
      return
    }

    const isLocal = localPlants.some((p) => p.plantId === selectedId)
    if (isLocal) {
      setSummary(null)
      setAnomalies([])
      setDetailLoading(false)
      return
    }

    let cancelled = false
    setDetailLoading(true)

    Promise.all([getDashboardSummary(selectedId), getAnomalies(selectedId, 100)])
      .then(([summaryRes, anomalyRes]) => {
        if (cancelled) {
          return
        }
        setSummary(summaryRes.data)
        setAnomalies(anomalyRes.data)
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(null)
          setAnomalies([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedId, localPlants])

  const selectedPlant = selectedId ? allPlants.find((p) => p.plantId === selectedId) ?? null : null

  const openAnomalies = anomalies.filter((a) => a.status === 'OPEN')
  const highOpenCount = openAnomalies.filter((a) => a.severity === 'HIGH').length

  const openRegisterModal = useCallback(() => {
    setRegisterModalOpen(true)
  }, [])

  const handleRegisterComplete = useCallback((payload: NewPlantPayload) => {
    let createdId = 0
    setLocalPlants((current) => {
      const nextId =
        Math.max(0, ...current.map((p) => p.plantId), ...plantsRef.current.map((p) => p.plantId)) + 1
      createdId = nextId
      const next: ClientRegisteredPlant = {
        plantId: nextId,
        name: payload.name,
        location: `${payload.sido} ${payload.sigungu}`.trim(),
        capacityKw: payload.capacityKw,
        status: 'ACTIVE',
        inverterModel: payload.inverterModel,
        sensorSerialNumber: payload.sensorSerial || null,
        registeredAtIso: new Date().toISOString(),
        installYear: payload.installYear,
      }
      return [next, ...current]
    })
    if (createdId > 0) {
      setSelectedId(createdId)
    }
    setRegisterToast('발전소가 목록에 추가되었습니다.')
    window.setTimeout(() => setRegisterToast(null), 4000)
  }, [])

  const renderDetail = (plant: Plant) => {
    const clientPlant = isClientRegisteredPlant(plant) ? plant : null

    if (!clientPlant && detailLoading && !summary) {
      return <p className={styles.loadingDetail}>불러오는 중…</p>
    }

    const subLine = clientPlant
      ? [
          `등록일: ${formatKoreanSignupYmd(clientPlant.registeredAtIso)}`,
          `설치 연도: ${clientPlant.installYear}년`,
          '마지막 동기화: 연동 대기',
        ].join(' · ')
      : [
          '등록일: —',
          summary?.lastUpdatedAt ? `마지막 동기화: ${formatKoreanDateTime(summary.lastUpdatedAt)}` : '마지막 동기화: —',
        ].join(' · ')

    const statFootBlue = clientPlant ? '데이터 연동 대기' : '실시간 요약 기준'
    const statFootGreen = clientPlant ? '데이터 연동 대기' : '대시보드 지표'
    const statFootRed = clientPlant
      ? '데이터 연동 대기'
      : highOpenCount > 0
        ? `HIGH ${highOpenCount}건`
        : '미해결 기준'

    return (
      <>
        <div className={styles.detailHeader}>
          <div className={styles.detailHeaderAccent} aria-hidden="true" />
          <div className={styles.detailHeaderTop}>
            <div>
              <h2 className={styles.detailTitle}>{plant.name}</h2>
              <p className={styles.detailSub}>{subLine}</p>
            </div>
            <span className={styles.statusBadgeLg}>
              {isActiveStatus(plant.status) ? '● ACTIVE' : `● ${plant.status}`}
            </span>
          </div>
        </div>

        <div className={styles.detailBody}>
          <h3 className={styles.sectionLabel}>기본 정보</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">◉</span>
            <div className={styles.infoLabels}>
              <span>발전소 ID</span>
              <span>{formatPlantId(plant.plantId)}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">◈</span>
            <div className={styles.infoLabels}>
              <span>발전소명</span>
              <span>{plant.name}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">◆</span>
            <div className={styles.infoLabels}>
              <span>위치</span>
              <span>{plant.location || '—'}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">★</span>
            <div className={styles.infoLabels}>
              <span>설비 용량</span>
              <span>
                {plant.capacityKw != null ? `${plant.capacityKw} kW` : '—'}
              </span>
            </div>
          </div>
          {clientPlant ? (
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">⌚</span>
              <div className={styles.infoLabels}>
                <span>설치 연도</span>
                <span>{clientPlant.installYear}년</span>
              </div>
            </div>
          ) : null}

          <hr className={styles.divider} />

          <h3 className={styles.sectionLabel}>설비 정보</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">⬡</span>
            <div className={styles.infoLabels}>
              <span>인버터 모델</span>
              <span>{plant.inverterModel ?? '—'}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">◎</span>
            <div className={styles.infoLabels}>
              <span>센서 시리얼</span>
              <span>{plant.sensorSerialNumber ?? '—'}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <h3 className={styles.sectionLabel}>운영 현황</h3>
          <div className={styles.statsRow}>
            <div className={[styles.statCard, styles.statCardBlue].join(' ')}>
              <p className={styles.statLabel}>오늘 발전량</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue} style={{ color: '#185fa5' }}>
                  {summary != null ? summary.todayGenerationKwh.toFixed(1) : '—'}
                </p>
                {summary != null ? <span className={styles.statUnit}>kWh</span> : null}
              </div>
              <p className={[styles.statFoot, styles.statFootBlue].join(' ')}>{statFootBlue}</p>
            </div>
            <div className={[styles.statCard, styles.statCardGreen].join(' ')}>
              <p className={styles.statLabel}>발전 효율</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue} style={{ color: '#1d9e75' }}>
                  {summary != null ? summary.efficiencyPercent.toFixed(1) : '—'}
                </p>
                {summary != null ? <span className={styles.statUnit}>%</span> : null}
              </div>
              <p className={[styles.statFoot, styles.statFootGreen].join(' ')}>{statFootGreen}</p>
            </div>
            <div className={[styles.statCard, styles.statCardRed].join(' ')}>
              <p className={styles.statLabel}>이상 이벤트</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue} style={{ color: '#e24b4a' }}>{clientPlant ? '—' : openAnomalies.length}</p>
                {!clientPlant ? <span className={styles.statUnit}>건</span> : null}
              </div>
              <p className={[styles.statFoot, styles.statFootRed].join(' ')}>{statFootRed}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          <h3 className={styles.sectionLabel}>빠른 이동</h3>
          <div className={styles.quickRow}>
            <Link className={styles.quickCard} to="/dashboard">
              <span className={[styles.quickIcon, styles.quickIconBlue].join(' ')} aria-hidden="true">⊞</span>
              <div className={styles.quickText}>
                <strong>대시보드 보기</strong>
                <span>실시간 발전량 확인</span>
              </div>
              <span className={styles.quickArrow} aria-hidden="true">→</span>
            </Link>
            <Link className={styles.quickCard} to="/anomaly-detection">
              <span className={[styles.quickIcon, styles.quickIconRed].join(' ')} aria-hidden="true">⚠</span>
              <div className={styles.quickText}>
                <strong>이상 감지 목록</strong>
                <span>이벤트 현황 확인</span>
              </div>
              <span className={[styles.quickArrow, styles.quickArrowRed].join(' ')} aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const showInitialLoading = isLoading && plants.length === 0 && localPlants.length === 0
  const showListFatalError = !isLoading && plants.length === 0 && !!errorMessage && localPlants.length === 0

  return (
    <div className={styles.pageShell}>
      <PlantRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onComplete={handleRegisterComplete}
      />

      <DashboardSidebar activeSection="dashboard" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <BackNavLink to="/dashboard">← 돌아가기</BackNavLink>
            <h1>발전소 설정</h1>
          </div>
          <button className={styles.registerButton} type="button" onClick={openRegisterModal}>
            + 발전소 등록
          </button>
        </header>

        {registerToast ? (
          <p className={styles.registerHint} role="status">
            {registerToast}
          </p>
        ) : null}

        <div className={styles.layout}>
          <section className={styles.listCard} aria-labelledby="plant-list-title">
            <div className={styles.listHeader}>
              <div className={styles.listHeaderTop}>
                <div>
                  <h2 id="plant-list-title">발전소 목록</h2>
                  <p>등록된 발전소 현황</p>
                </div>
                <span className={styles.countBadge}>
                  총 {allPlants.length.toLocaleString('ko-KR')}개
                </span>
              </div>
            </div>

            <div className={styles.listBody}>
              {showInitialLoading ? (
                <p className={styles.emptyState}>목록을 불러오는 중…</p>
              ) : showListFatalError ? (
                <p className={styles.emptyState}>{errorMessage}</p>
              ) : allPlants.length === 0 ? (
                <p className={styles.emptyState}>등록된 발전소가 없습니다.</p>
              ) : (
                allPlants.map((plant) => {
                  const selected = plant.plantId === selectedId
                  return (
                    <button
                      key={`${isClientRegisteredPlant(plant) ? 'local' : 'api'}-${plant.plantId}`}
                      type="button"
                      className={[styles.plantRow, selected ? styles.plantRowSelected : ''].filter(Boolean).join(' ')}
                      onClick={() => setSelectedId(plant.plantId)}
                    >
                      {selected ? <span className={styles.plantRowAccent} aria-hidden="true" /> : null}
                      <div className={styles.plantRowTop}>
                        <span className={styles.idPill}>{formatPlantId(plant.plantId)}</span>
                        <span className={styles.statusPill}>
                          {isActiveStatus(plant.status) ? '● ACTIVE' : `● ${plant.status}`}
                        </span>
                      </div>
                      <p className={styles.plantName}>{plant.name}</p>
                      <p className={styles.plantMeta}>
                        {[plant.location, plant.capacityKw != null ? `${plant.capacityKw} kW` : null].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <span className={styles.chevron} aria-hidden="true">›</span>
                    </button>
                  )
                })
              )}

              <button type="button" className={styles.addPlaceholder} onClick={openRegisterModal}>
                <span className={styles.addPlus} aria-hidden="true">+</span>
                <span className={styles.addLabel}>새 발전소 등록</span>
              </button>
            </div>
          </section>

          <section className={styles.detailCard} aria-label="선택한 발전소 상세">
            {selectedPlant ? renderDetail(selectedPlant) : (
              <p className={styles.emptyState}>발전소를 선택해 주세요.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
