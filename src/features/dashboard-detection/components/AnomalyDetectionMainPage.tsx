import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnomalies, updateAnomalyStatus } from '@/api'
import type { AnomalyEvent } from '@/api'
import { useDefaultPlant } from '@/shared/hooks/useDefaultPlant'
import { DashboardSidebar } from '@/shared/layout/DashboardSidebar'
import { formatKoreanDateTime } from '@/shared/utils/dateFormat'
import { getFallbackText } from '@/shared/utils/text'
import styles from './AnomalyDetectionMainPage.module.css'

const typeFilterOptions = ['POWER', 'VISION'] as const
const severityFilterOptions = ['HIGH', 'MEDIUM', 'LOW'] as const
const statusFilterOptions = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] as const
const sortOptions = [
  { id: 'latest', label: '최신순' },
  { id: 'type', label: '유형순' },
  { id: 'severity', label: '심각도순' },
] as const
const fallbackEventPageSize = 5
const estimatedEventCardHeight = 88

type TypeFilter = (typeof typeFilterOptions)[number]
type SeverityFilter = (typeof severityFilterOptions)[number]
type StatusFilter = (typeof statusFilterOptions)[number]
type FilterMenu = 'type' | 'severity' | 'status' | null
type SortOptionId = (typeof sortOptions)[number]['id']

const typeOrder: Record<string, number> = {
  POWER: 0,
  VISION: 1,
}

const severityOrder: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
}

function getEventTone(event: AnomalyEvent) {
  if (event.status === 'RESOLVED') {
    return 'muted'
  }

  if (event.severity === 'HIGH') {
    return 'red'
  }

  if (event.severity === 'MEDIUM') {
    return 'amber'
  }

  return 'blue'
}

function getFilterLabel(selectedValues: readonly string[]) {
  if (selectedValues.length === 0) {
    return '전체'
  }

  if (selectedValues.length === 1) {
    return selectedValues[0]
  }

  return `${selectedValues[0]} 외 ${selectedValues.length - 1}`
}

function toggleFilterValue<T extends string>(selectedValues: T[], value: T) {
  return selectedValues.includes(value)
    ? selectedValues.filter((selectedValue) => selectedValue !== value)
    : [...selectedValues, value]
}

export function AnomalyDetectionMainPage() {
  const eventListRef = useRef<HTMLDivElement | null>(null)
  const { defaultPlantId, isLoading: isPlantLoading, errorMessage: plantErrorMessage } = useDefaultPlant()
  const [events, setEvents] = useState<AnomalyEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [openFilterMenu, setOpenFilterMenu] = useState<FilterMenu>(null)
  const [selectedTypes, setSelectedTypes] = useState<TypeFilter[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityFilter[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<StatusFilter[]>([])
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortOption, setSortOption] = useState<SortOptionId>('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const [eventPageSize, setEventPageSize] = useState(fallbackEventPageSize)

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.type as TypeFilter)
        const matchesSeverity = selectedSeverities.length === 0 || selectedSeverities.includes(event.severity as SeverityFilter)
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(event.status as StatusFilter)

        return matchesType && matchesSeverity && matchesStatus
      }),
    [events, selectedSeverities, selectedStatuses, selectedTypes],
  )

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortOption === 'type') {
        const typeDiff = (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99)
        return typeDiff || new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      }

      if (sortOption === 'severity') {
        const severityDiff = (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99)
        return severityDiff || new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      }

      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })
  }, [filteredEvents, sortOption])

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / eventPageSize))
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * eventPageSize
    return sortedEvents.slice(startIndex, startIndex + eventPageSize)
  }, [currentPage, sortedEvents])
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  )

  const selectedEvent = useMemo(
    () => paginatedEvents.find((event) => event.eventId === selectedEventId) ?? paginatedEvents[0] ?? null,
    [paginatedEvents, selectedEventId],
  )

  const summaryCards = useMemo(() => {
    const highCount = events.filter((event) => event.severity === 'HIGH').length
    const mediumCount = events.filter((event) => event.severity === 'MEDIUM').length
    const lowCount = events.filter((event) => event.severity === 'LOW').length

    return [
      { label: '전체', value: String(events.length), tone: 'dark' },
      { label: 'HIGH', value: String(highCount), tone: 'redSoft' },
      { label: 'MEDIUM', value: String(mediumCount), tone: 'amber' },
      { label: 'LOW', value: String(lowCount), tone: 'blue' },
    ] as const
  }, [events])

  useEffect(() => {
    if (isPlantLoading) {
      return
    }

    if (!defaultPlantId) {
      setErrorMessage(plantErrorMessage || '조회 가능한 발전소가 없습니다.')
      setIsLoading(false)
      return
    }

    let isActive = true

    const fetchEvents = () => {
      getAnomalies(defaultPlantId, 1000)
        .then((response) => {
          if (!isActive) {
            return
          }

          setEvents(response.data)
          setSelectedEventId((currentId) => {
            if (currentId && response.data.some((event) => event.eventId === currentId)) {
              return currentId
            }

            return response.data[0]?.eventId ?? null
          })
          setErrorMessage('')
          setIsLoading(false)
        })
        .catch((error) => {
          if (!isActive) {
            return
          }

          setErrorMessage(error instanceof Error ? error.message : '이상 이벤트 목록을 불러오지 못했습니다.')
          setIsLoading(false)
        })
    }

    fetchEvents()
    const pollingTimer = window.setInterval(fetchEvents, 5000)

    return () => {
      isActive = false
      window.clearInterval(pollingTimer)
    }
  }, [defaultPlantId, isPlantLoading, plantErrorMessage])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSeverities, selectedStatuses, selectedTypes, sortOption])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  useEffect(() => {
    const eventListElement = eventListRef.current

    if (!eventListElement) {
      return
    }

    const updatePageSize = () => {
      const nextPageSize = Math.max(1, Math.floor((eventListElement.clientHeight + 8) / estimatedEventCardHeight))
      setEventPageSize(nextPageSize)
    }

    updatePageSize()

    const resizeObserver = new ResizeObserver(updatePageSize)
    resizeObserver.observe(eventListElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleAcknowledge = () => {
    if (!defaultPlantId || !selectedEvent || selectedEvent.status === 'ACKNOWLEDGED' || selectedEvent.status === 'RESOLVED') {
      return
    }

    setIsUpdating(true)
    setErrorMessage('')

    updateAnomalyStatus(defaultPlantId, selectedEvent.eventId, 'ACKNOWLEDGED')
      .then(() => getAnomalies(defaultPlantId, 1000))
      .then((refresh) => {
        setEvents(refresh.data)
        setSelectedEventId((currentId) => {
          if (currentId && refresh.data.some((e) => e.eventId === currentId)) {
            return currentId
          }
          return refresh.data[0]?.eventId ?? null
        })
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : '확인 완료 처리에 실패했습니다.')
      })
      .finally(() => {
        setIsUpdating(false)
      })
  }

  const selectedSortLabel = sortOptions.find((option) => option.id === sortOption)?.label ?? '최신순'

  const renderFilterMenu = <T extends string,>(
    id: Exclude<FilterMenu, null>,
    label: string,
    selectedValues: T[],
    options: readonly T[],
    onChange: (nextValues: T[]) => void,
  ) => (
    <div className={styles.filterGroup}>
      <button
        className={styles.filterTrigger}
        type="button"
        aria-expanded={openFilterMenu === id}
        onClick={() => setOpenFilterMenu((currentMenu) => (currentMenu === id ? null : id))}
      >
        <span>{label}</span>
        {getFilterLabel(selectedValues)} ▾
      </button>

      {openFilterMenu === id ? (
        <div className={styles.filterDropdown}>
          <button
            className={[styles.filterOption, selectedValues.length === 0 ? styles.filterOptionSelected : ''].filter(Boolean).join(' ')}
            type="button"
            onClick={() => onChange([])}
          >
            <span>{selectedValues.length === 0 ? '✓' : ''}</span>
            전체
          </button>
          {options.map((option) => (
            <button
              key={option}
              className={[styles.filterOption, selectedValues.includes(option) ? styles.filterOptionSelected : ''].filter(Boolean).join(' ')}
              type="button"
              onClick={() => onChange(toggleFilterValue(selectedValues, option))}
            >
              <span>{selectedValues.includes(option) ? '✓' : ''}</span>
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <div className={styles.page}>
      <DashboardSidebar activeSection="anomaly" />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>이상 감지</h1>
            <p>발전량 이상 및 패널 이상 이벤트</p>
          </div>

          <div className={styles.filters} aria-label="이벤트 필터">
            {renderFilterMenu('type', '유형', selectedTypes, typeFilterOptions, setSelectedTypes)}
            {renderFilterMenu('severity', '심각도', selectedSeverities, severityFilterOptions, setSelectedSeverities)}
            {renderFilterMenu('status', '상태', selectedStatuses, statusFilterOptions, setSelectedStatuses)}
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.summaryGrid} aria-label="이상 감지 요약">
            {summaryCards.map((card) => (
              <article key={card.label} className={[styles.summaryCard, styles[card.tone]].join(' ')}>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </article>
            ))}
          </section>

          <section className={styles.eventList} aria-labelledby="event-list-title">
            <div className={styles.panelHeader}>
              <div>
                <h2 id="event-list-title">이벤트 목록</h2>
                <p>{selectedSortLabel} · {sortedEvents.length}건 표시</p>
              </div>
              <div className={styles.sortGroup}>
                <button
                  type="button"
                  aria-expanded={isSortMenuOpen}
                  onClick={() => setIsSortMenuOpen((isOpen) => !isOpen)}
                >
                  {selectedSortLabel} ▾
                </button>

                {isSortMenuOpen ? (
                  <div className={styles.sortDropdown}>
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        className={option.id === sortOption ? styles.sortOptionSelected : ''}
                        type="button"
                        onClick={() => {
                          setSortOption(option.id)
                          setIsSortMenuOpen(false)
                        }}
                      >
                        <span>{option.id === sortOption ? '✓' : ''}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div ref={eventListRef} className={styles.events}>
              {isLoading ? <p className={styles.emptyState}>이상 이벤트를 불러오는 중입니다.</p> : null}
              {!isLoading && events.length === 0 ? <p className={styles.emptyState}>등록된 이상 이벤트가 없습니다.</p> : null}
              {!isLoading && events.length > 0 && sortedEvents.length === 0 ? <p className={styles.emptyState}>선택한 필터에 해당하는 이벤트가 없습니다.</p> : null}
              {paginatedEvents.map((event) => (
                <button
                  key={event.eventId}
                  type="button"
                  className={[styles.eventItem, styles[getEventTone(event)], selectedEvent?.eventId === event.eventId ? styles.eventSelected : ''].filter(Boolean).join(' ')}
                  onClick={() => setSelectedEventId(event.eventId)}
                >
                  <div className={styles.eventTags}>
                    <span>{event.severity}</span>
                    <small>{event.type}</small>
                  </div>
                  <h3>{event.summary}</h3>
                  <time>{formatKoreanDateTime(event.detectedAt)}</time>
                  <b className={styles[`status${event.status}`]}>{event.status}</b>
                </button>
              ))}
            </div>

            {totalPages > 1 ? (
              <nav className={styles.pagination} aria-label="이벤트 목록 페이지">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  &lt;
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={pageNumber === currentPage ? styles.paginationActive : ''}
                    type="button"
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  &gt;
                </button>
              </nav>
            ) : null}
          </section>

          <section className={styles.detailPanel} aria-labelledby="event-detail-title">
            {selectedEvent ? (
              <>
                <div className={styles.detailHero}>
                  <div className={styles.eventTags}>
                    <span>{selectedEvent.severity}</span>
                    <small>{selectedEvent.type}</small>
                  </div>
                  <time>{formatKoreanDateTime(selectedEvent.detectedAt)}</time>
                  <strong className={styles[`status${selectedEvent.status}`]}>{selectedEvent.status}</strong>
                  <h2 id="event-detail-title">{selectedEvent.summary}</h2>
                </div>

                <div className={styles.detailBody}>
                  <h3>원인 분석</h3>
                  <div className={[styles.insightBox, styles.causeBox].join(' ')}>
                    {getFallbackText(selectedEvent.cause, '아직 등록된 원인 분석 내용이 없습니다.')}
                  </div>

                  <h3>XAI 판단 근거</h3>
                  <div className={[styles.insightBox, styles.xaiBox].join(' ')}>
                    <p>{getFallbackText(selectedEvent.xaiExplanation, '아직 등록된 XAI 판단 근거가 없습니다.')}</p>
                  </div>

                  <h3>권장 조치</h3>
                  <div className={[styles.insightBox, styles.actionBox].join(' ')}>
                    {getFallbackText(selectedEvent.recommendedAction, '담당자가 이벤트를 확인한 뒤 조치 내용을 등록하세요.')}
                  </div>

                  <div className={styles.detailActions}>
                    <button
                      type="button"
                      onClick={handleAcknowledge}
                      disabled={isUpdating || selectedEvent.status === 'ACKNOWLEDGED' || selectedEvent.status === 'RESOLVED'}
                    >
                      {selectedEvent.status === 'ACKNOWLEDGED' || selectedEvent.status === 'RESOLVED' ? '✓ 확인 완료됨' : '✓ 확인 완료 처리'}
                    </button>
                    <Link to={`/anomaly-detection/detail?eventId=${selectedEvent.eventId}`}>상세 보기 →</Link>
                  </div>

                  {errorMessage ? <p className={styles.errorText}>{errorMessage}</p> : null}
                  <p className={styles.aiNote}>AI 원인 설명 챗 포함 - 상세 화면에서 AI에게 직접 질문하세요</p>
                </div>
              </>
            ) : (
              <div className={styles.emptyDetail}>
                <h2 id="event-detail-title">선택된 이벤트가 없습니다.</h2>
                <p>{errorMessage || '이벤트가 등록되면 우측 카드에서 내용을 확인할 수 있습니다.'}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
