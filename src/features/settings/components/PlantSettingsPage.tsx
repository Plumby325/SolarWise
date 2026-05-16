import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPlant, estimatePanelCountFromCapacityKw, getAnomalies, getDashboardSummary } from '@/api'
import type { AnomalyEvent, DashboardSummary, Plant } from '@/api'
import type { NewPlantPayload } from '@/features/settings/plantRegisterTypes'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { BackNavLink } from '@/shared/ui/BackNavLink'
import { formatKoreanDateTime } from '@/shared/utils/dateFormat'
import { PlantRegisterModal } from './PlantRegisterModal'
import styles from './PlantSettingsPage.module.css'

function formatPlantId(plantId: number) {
  return `#${plantId}`
}

function isActiveStatus(status: string) {
  return status.toUpperCase() === 'ACTIVE'
}

export function PlantSettingsPage() {
  const { plants, isLoading, errorMessage, refetch } = useDefaultPlant()

  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  const [registerToast, setRegisterToast] = useState<string | null>(null)

  useEffect(() => {
    if (!plants.length) {
      setSelectedPlantId(null)
      return
    }
    setSelectedPlantId((prev) => {
      if (prev != null && plants.some((p) => p.plantId === prev)) {
        return prev
      }
      return plants[0].plantId
    })
  }, [plants])

  useEffect(() => {
    if (selectedPlantId == null) {
      setSummary(null)
      setAnomalies([])
      return
    }

    let cancelled = false
    setDetailLoading(true)

    Promise.all([getDashboardSummary(selectedPlantId), getAnomalies(selectedPlantId, 100)])
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
  }, [selectedPlantId])

  const selectedPlant =
    selectedPlantId != null ? plants.find((p) => p.plantId === selectedPlantId) ?? null : null

  const openAnomalies = anomalies.filter((a) => a.status === 'OPEN')
  const highOpenCount = openAnomalies.filter((a) => a.severity === 'HIGH').length

  const openRegisterModal = useCallback(() => {
    setRegisterModalOpen(true)
  }, [])

  const handleRegisterComplete = useCallback(
    async (payload: NewPlantPayload) => {
      const location = `${payload.sido} ${payload.sigungu}`.trim()
      const panelCount = estimatePanelCountFromCapacityKw(payload.capacityKw)
      const res = await createPlant({
        name: payload.name,
        location,
        capacityKw: payload.capacityKw,
        panelCount,
        inverterModel: payload.inverterModel,
        sensorSerialNumber: payload.sensorSerial.trim() || undefined,
      })
      await refetch()
      setSelectedPlantId(res.data.plantId)
      setRegisterToast('발전소가 서버에 저장되었습니다.')
      window.setTimeout(() => setRegisterToast(null), 4000)
    },
    [refetch],
  )

  const renderDetail = (plant: Plant) => {
    if (detailLoading && !summary) {
      return <p className={styles.loadingDetail}>불러오는 중…</p>
    }

    const subLine = [
      '등록일: —',
      summary?.lastUpdatedAt ? `마지막 동기화: ${formatKoreanDateTime(summary.lastUpdatedAt)}` : '마지막 동기화: —',
    ].join(' · ')

    const statFootBlue = '실시간 요약 기준'
    const statFootGreen = '대시보드 지표'
    const statFootRed = highOpenCount > 0 ? `HIGH ${highOpenCount}건` : '미해결 기준'

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
            <span className={styles.infoIcon} aria-hidden="true">
              ◉
            </span>
            <div className={styles.infoLabels}>
              <span>발전소 ID</span>
              <span>{formatPlantId(plant.plantId)}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">
              ◈
            </span>
            <div className={styles.infoLabels}>
              <span>발전소명</span>
              <span>{plant.name}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">
              ◆
            </span>
            <div className={styles.infoLabels}>
              <span>위치</span>
              <span>{plant.location || '—'}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">
              ★
            </span>
            <div className={styles.infoLabels}>
              <span>설비 용량</span>
              <span>{plant.capacityKw != null ? `${plant.capacityKw} kW` : '—'}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <h3 className={styles.sectionLabel}>설비 정보</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">
              ⬡
            </span>
            <div className={styles.infoLabels}>
              <span>인버터 모델</span>
              <span>{plant.inverterModel ?? '—'}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon} aria-hidden="true">
              ◎
            </span>
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
                <p className={styles.statValue} style={{ color: '#e24b4a' }}>
                  {openAnomalies.length}
                </p>
                <span className={styles.statUnit}>건</span>
              </div>
              <p className={[styles.statFoot, styles.statFootRed].join(' ')}>{statFootRed}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          <h3 className={styles.sectionLabel}>빠른 이동</h3>
          <div className={styles.quickRow}>
            <Link className={styles.quickCard} to="/dashboard">
              <span className={[styles.quickIcon, styles.quickIconBlue].join(' ')} aria-hidden="true">
                ⊞
              </span>
              <div className={styles.quickText}>
                <strong>대시보드 보기</strong>
                <span>실시간 발전량 확인</span>
              </div>
              <span className={styles.quickArrow} aria-hidden="true">
                →
              </span>
            </Link>
            <Link className={styles.quickCard} to="/anomaly-detection">
              <span className={[styles.quickIcon, styles.quickIconRed].join(' ')} aria-hidden="true">
                ⚠
              </span>
              <div className={styles.quickText}>
                <strong>이상 감지 목록</strong>
                <span>이벤트 현황 확인</span>
              </div>
              <span className={[styles.quickArrow, styles.quickArrowRed].join(' ')} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const showInitialLoading = isLoading && plants.length === 0
  const showListFatalError = !isLoading && plants.length === 0 && !!errorMessage

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
                <span className={styles.countBadge}>총 {plants.length.toLocaleString('ko-KR')}개</span>
              </div>
            </div>

            <div className={styles.listBody}>
              {showInitialLoading ? (
                <p className={styles.emptyState}>목록을 불러오는 중…</p>
              ) : showListFatalError ? (
                <p className={styles.emptyState}>{errorMessage}</p>
              ) : plants.length === 0 ? (
                <p className={styles.emptyState}>등록된 발전소가 없습니다.</p>
              ) : (
                plants.map((plant) => {
                  const selected = plant.plantId === selectedPlantId
                  return (
                    <button
                      key={plant.plantId}
                      type="button"
                      className={[styles.plantRow, selected ? styles.plantRowSelected : ''].filter(Boolean).join(' ')}
                      onClick={() => setSelectedPlantId(plant.plantId)}
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
                        {[plant.location, plant.capacityKw != null ? `${plant.capacityKw} kW` : null]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </p>
                      <span className={styles.chevron} aria-hidden="true">
                        ›
                      </span>
                    </button>
                  )
                })
              )}

              <button type="button" className={styles.addPlaceholder} onClick={openRegisterModal}>
                <span className={styles.addPlus} aria-hidden="true">
                  +
                </span>
                <span className={styles.addLabel}>새 발전소 등록</span>
              </button>
            </div>
          </section>

          <section className={styles.detailCard} aria-label="선택한 발전소 상세">
            {selectedPlant ? (
              renderDetail(selectedPlant)
            ) : (
              <p className={styles.emptyState}>발전소를 선택해 주세요.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
