import { useEffect, useId, useState } from 'react'
import type { NewPlantPayload } from '@/features/settings/plantRegisterTypes'
import styles from './PlantRegisterModal.module.css'

export type PlantRegisterModalProps = {
  isOpen: boolean
  onClose: () => void
  onComplete?: (payload: NewPlantPayload) => void | Promise<void>
}

const SIDO_OPTIONS = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const

const SIGUNGU_BY_SIDO: Record<string, string[]> = {
  서울특별시: ['강남구', '서초구', '영등포구', '마포구'],
  부산광역시: ['해운대구', '부산진구', '남구'],
  대구광역시: ['수성구', '달서구'],
  인천광역시: ['연수구', '남동구'],
  광주광역시: ['서구', '북구'],
  대전광역시: ['유성구', '서구'],
  울산광역시: ['남구', '울주군'],
  세종특별자치시: ['세종시'],
  경기도: ['수원시', '성남시', '고양시', '용인시'],
  강원특별자치도: ['춘천시', '원주시', '강릉시'],
  충청북도: ['청주시', '충주시'],
  충청남도: ['천안시', '아산시'],
  전북특별자치도: ['전주시', '익산시', '군산시', '김제시', '정읍시'],
  전라남도: ['여수시', '순천시'],
  경상북도: ['포항시', '구미시'],
  경상남도: ['창원시', '김해시'],
  제주특별자치도: ['제주시', '서귀포시'],
}

const YEAR_OPTIONS = (() => {
  const y = new Date().getFullYear()
  const list: number[] = []
  for (let i = y; i >= 1990; i--) {
    list.push(i)
  }
  return list
})()

export function PlantRegisterModal({ isOpen, onClose, onComplete }: PlantRegisterModalProps) {
  const titleId = useId()
  const [step, setStep] = useState<1 | 2>(1)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [sido, setSido] = useState('')
  const [sigungu, setSigungu] = useState('')
  const [capacityKw, setCapacityKw] = useState('')
  const [installYear, setInstallYear] = useState('')

  const [inverterModel, setInverterModel] = useState('')
  const [sensorSerial, setSensorSerial] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setStep(1)
    setFormError('')
    setName('')
    setSido('')
    setSigungu('')
    setCapacityKw('')
    setInstallYear('')
    setInverterModel('')
    setSensorSerial('')
    setIsSubmitting(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) {
    return null
  }

  const sigunguOptions = sido ? SIGUNGU_BY_SIDO[sido] ?? ['시·군·구'] : []

  const previewLocation = [sido, sigungu].filter(Boolean).join(' ')
  const previewCapacity = capacityKw.trim() ? `${capacityKw.trim()} kW` : '—'

  const validateStep1 = () => {
    if (!name.trim()) {
      return '발전소명을 입력해 주세요.'
    }
    if (!sido) {
      return '시·도를 선택해 주세요.'
    }
    if (!sigungu) {
      return '시·군·구를 선택해 주세요.'
    }
    const cap = Number(capacityKw)
    if (!capacityKw.trim() || Number.isNaN(cap) || cap <= 0) {
      return '설비 용량(kW)을 올바르게 입력해 주세요.'
    }
    if (!installYear) {
      return '설치 연도를 선택해 주세요.'
    }
    return ''
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) {
      setFormError(err)
      return
    }
    setFormError('')
    setStep(2)
  }

  const handleComplete = async () => {
    if (isSubmitting) {
      return
    }
    if (!inverterModel.trim()) {
      setFormError('인버터 모델을 입력해 주세요.')
      return
    }
    const err = validateStep1()
    if (err) {
      setFormError(err)
      setStep(1)
      return
    }
    const cap = Number(capacityKw)
    setFormError('')
    try {
      setIsSubmitting(true)
      await onComplete?.({
        name: name.trim(),
        sido,
        sigungu,
        capacityKw: cap,
        installYear: Number(installYear),
        inverterModel: inverterModel.trim(),
        sensorSerial: sensorSerial.trim(),
      })
      onClose()
    } catch (submitErr) {
      const msg = submitErr instanceof Error ? submitErr.message : '등록에 실패했습니다.'
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => {
        if (!isSubmitting) {
          onClose()
        }
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id={titleId}>발전소 등록</h2>
          <p className={styles.subtitle}>
            {step === 1 ? '발전소 기본 정보를 입력해주세요.' : 'Step 2 / 2 — 설비 정보'}
          </p>
          <button className={styles.closeBtn} type="button" aria-label="닫기" disabled={isSubmitting} onClick={onClose}>
            ✕
          </button>
        </header>

        <div className={styles.stepTrack}>
          {step === 1 ? (
            <>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '50%' }} />
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepLabelActive}>Step 1</span>
                <span className={styles.stepLabelDim}>Step 2</span>
              </div>
              <div className={styles.stepRow}>
                <span className={styles.stepLabelActive}>기본 정보</span>
                <span className={styles.stepLabelMuted}>설비 정보</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '100%' }} />
              </div>
              <div className={styles.step2DoneRow}>
                <span className={styles.step1DonePill}>Step 1 ✓</span>
                <div className={styles.step2Titles}>
                  <span className={styles.stepLabelActive}>Step 2</span>
                  <span className={styles.stepLabelMuted}> 설비 정보</span>
                </div>
              </div>
            </>
          )}
        </div>

        {formError ? (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        ) : null}

        <div className={styles.body}>
          {step === 1 ? (
            <>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-plant-name">발전소명 *</label>
                <input
                  id="reg-plant-name"
                  className={styles.input}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 전북 익산 1호 발전소"
                  autoComplete="off"
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>위치 *</span>
                <div className={styles.row2}>
                  <select
                    className={styles.select}
                    value={sido}
                    onChange={(event) => {
                      setSido(event.target.value)
                      setSigungu('')
                    }}
                    aria-label="시·도 선택"
                  >
                    <option value="">시/도 선택</option>
                    {SIDO_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    className={styles.select}
                    value={sigungu}
                    onChange={(event) => setSigungu(event.target.value)}
                    disabled={!sido}
                    aria-label="시·군·구 선택"
                  >
                    <option value="">시/군/구 선택</option>
                    {sigunguOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-capacity">설비 용량 *</label>
                <div className={styles.capacityRow}>
                  <input
                    id="reg-capacity"
                    className={styles.input}
                    inputMode="decimal"
                    value={capacityKw}
                    onChange={(event) => setCapacityKw(event.target.value)}
                    placeholder="예: 120.5"
                  />
                  <span className={styles.kwSuffix}>kW</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-year">설치 연도 *</label>
                <select
                  id="reg-year"
                  className={styles.select}
                  value={installYear}
                  onChange={(event) => setInstallYear(event.target.value)}
                >
                  <option value="">연도 선택</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>

              <div className={styles.hintInfo}>
                <span aria-hidden="true">ℹ</span>
                <span>설비 정보(인버터·센서)는 다음 단계에서 입력합니다.</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-inverter">인버터 모델 *</label>
                <input
                  id="reg-inverter"
                  className={styles.input}
                  value={inverterModel}
                  onChange={(event) => setInverterModel(event.target.value)}
                  placeholder="예: INV-3000"
                  autoComplete="off"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="reg-sensor">
                  센서 시리얼 번호
                  <span className={styles.optionalBadge}>선택사항</span>
                </label>
                <input
                  id="reg-sensor"
                  className={styles.input}
                  value={sensorSerial}
                  onChange={(event) => setSensorSerial(event.target.value)}
                  placeholder="예: SNSR-2026-0001 (없으면 비워두세요)"
                  autoComplete="off"
                />
              </div>

              <div className={styles.hintGreen}>
                <strong aria-hidden="true">◆</strong>
                <div>
                  <div>센서가 없어도 인버터 데이터만으로 기본 모니터링이 가능합니다.</div>
                  <div>센서 연동은 이후 발전소 관리에서 추가할 수 있습니다.</div>
                </div>
              </div>

              <hr className={styles.divider} />

              <p className={styles.previewCaption}>등록 후 발전소 카드 미리보기</p>
              <div className={styles.previewCard}>
                <span className={styles.previewAccent} aria-hidden="true" />
                <div className={styles.previewTitleRow}>
                  <h3 className={styles.previewTitle}>{name.trim() || '발전소명'}</h3>
                  <span className={styles.previewStatus}>● ACTIVE</span>
                </div>
                <p className={styles.previewMeta}>
                  {previewLocation || '위치'} · {previewCapacity}
                </p>
              </div>

              <p className={styles.featureCaption}>등록 후 바로 사용할 수 있는 기능</p>
              <div className={styles.featurePills}>
                <span className={[styles.pill, styles.pillBlue].join(' ')}>실시간 모니터링</span>
                <span className={[styles.pill, styles.pillRed].join(' ')}>AI 이상 감지</span>
                <span className={[styles.pill, styles.pillGreen].join(' ')}>발전량 예측</span>
              </div>
            </>
          )}
        </div>

        <footer className={styles.footer}>
          {step === 1 ? (
            <>
              <button className={styles.btnSecondary} type="button" disabled={isSubmitting} onClick={onClose}>
                취소
              </button>
              <button className={styles.btnPrimary} type="button" disabled={isSubmitting} onClick={handleNext}>
                다음 단계 →
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.btnSecondary}
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setFormError('')
                  setStep(1)
                }}
              >
                ← 이전
              </button>
              <button className={styles.btnSuccess} type="button" disabled={isSubmitting} onClick={() => void handleComplete()}>
                {isSubmitting ? '등록 중…' : '✓ 등록 완료'}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
