import type { ChangeEvent, FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './FindingPasswordPage.module.css'

type FindingPasswordPageProps = {
  step: 1 | 2 | 3
}

type PasswordChecks = {
  hasLetter: boolean
  hasNumber: boolean
  hasSpecial: boolean
  hasMinLength: boolean
}

function getPasswordChecks(password: string): PasswordChecks {
  return {
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
    hasMinLength: password.length >= 8,
  }
}

function getPasswordStrength(checks: PasswordChecks) {
  const score = Object.values(checks).filter(Boolean).length

  if (score <= 1) {
    return { label: '약함', tone: 'weak' as const, bars: 1 }
  }

  if (score <= 3) {
    return { label: '보통', tone: 'medium' as const, bars: 2 }
  }

  return { label: '강함', tone: 'strong' as const, bars: 3 }
}

function LeftPanel({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <>
        <h1 className={styles.heroTitle}>
          <span>비밀번호를</span>
          <span className={styles.heroTitleAccent}>잊으셨나요?</span>
        </h1>
        <p className={styles.heroDescription}>이메일 인증을 통해 안전하게 비밀번호를 재설정할 수 있어요.</p>
        <ul className={styles.stepList}>
          <li>
            <span className={styles.stepIcon}>◉</span> 등록된 이메일 주소 입력
          </li>
          <li>
            <span className={styles.stepIcon}>◈</span> 인증 메일 수신 확인
          </li>
          <li>
            <span className={styles.stepIcon}>◆</span> 새 비밀번호 설정 완료
          </li>
        </ul>
      </>
    )
  }

  if (step === 2) {
    return (
      <>
        <h1 className={styles.heroTitle}>
          <span>인증 메일을</span>
          <span className={styles.heroTitleSuccess}>발송했어요!</span>
        </h1>
        <p className={styles.heroDescription}>이메일 수신함을 확인하고 링크를 클릭해 비밀번호를 재설정하세요.</p>
        <ul className={styles.stepList}>
          <li className={styles.completedStep}>
            <span className={styles.doneIcon}>✓</span> 등록된 이메일 주소 입력
          </li>
          <li className={styles.completedStep}>
            <span className={styles.doneIcon}>✓</span> 인증 메일 수신 확인
          </li>
          <li>
            <span className={styles.stepIcon}>◆</span> 새 비밀번호 설정 완료
          </li>
        </ul>
      </>
    )
  }

  return (
    <>
      <h1 className={styles.heroTitle}>
        <span>거의 다 왔어요!</span>
        <span className={styles.heroTitleAccent}>새 비밀번호를 설정해주세요.</span>
      </h1>
      <p className={styles.heroDescription}>안전한 비밀번호로 발전소를 보호하세요.</p>
      <ul className={styles.stepList}>
        <li className={styles.completedStep}>
          <span className={styles.doneIcon}>✓</span> 이메일 확인 완료
        </li>
        <li className={styles.completedStep}>
          <span className={styles.doneIcon}>✓</span> 인증 메일 확인 완료
        </li>
        <li>
          <span className={styles.stepIcon}>◆</span> 새 비밀번호 설정 중
        </li>
      </ul>
    </>
  )
}

export function FindingPasswordPage({ step }: FindingPasswordPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('user@solarwise.com')
  const [emailError, setEmailError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword])
  const strength = useMemo(() => getPasswordStrength(checks), [checks])

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim()) {
      setEmailError('이메일을 입력해 주세요.')
      return
    }

    if (!email.includes('@')) {
      setEmailError('올바른 이메일 형식을 입력해 주세요.')
      return
    }

    setEmailError('')
    const resetToken = crypto.randomUUID()
    navigate(`/finding-password/mail-sent?email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(resetToken)}`)
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!checks.hasLetter || !checks.hasNumber || !checks.hasSpecial || !checks.hasMinLength) {
      setPasswordError('영문, 숫자, 특수문자를 포함한 8자 이상 비밀번호를 입력해 주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setPasswordError('')
    navigate('/login')
  }

  const displayEmail = useMemo(() => {
    return searchParams.get('email') ?? email
  }, [email, searchParams])
  const resetToken = searchParams.get('token') ?? ''
  const hasResetToken = resetToken.length > 0

  return (
    <div className={styles.page}>
      <SiteHeader active="login" ariaLabel="비밀번호 찾기 페이지 메뉴" />

      <main className={styles.main}>
        <section className={styles.brandPanel}>
          <div className={styles.backgroundCircleLarge} aria-hidden="true" />
          <div className={styles.backgroundCircleTop} aria-hidden="true" />
          <div className={styles.backgroundCircleBottom} aria-hidden="true" />
          <div className={styles.gridLines} aria-hidden="true" />

          <div className={styles.brandInner}>
            <div className={styles.brandBadge}>
              <span className={styles.brandSunSmall} />
              <span className={styles.brandTextOnDarkPrimary}>Solar</span>
              <span className={styles.brandTextOnDarkAccent}>Wise</span>
            </div>
            <LeftPanel step={step} />
            <div className={styles.securityBadge}>◆ 256bit SSL 암호화 · 안전한 비밀번호 재설정</div>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressValue}
                style={{ width: step === 1 ? '33.333%' : step === 2 ? '66.666%' : '100%' }}
                aria-hidden="true"
              />
            </div>
            <div className={styles.progressMeta}>
              <span>{step} / 3 단계</span>
              <span>{step === 3 ? '거의 완료 ✓' : step === 2 ? '메일 확인' : '이메일 확인'}</span>
            </div>

            {step === 1 ? (
              <form className={styles.form} onSubmit={handleEmailSubmit} noValidate>
                <header className={styles.formHeader}>
                  <h1>비밀번호 찾기</h1>
                  <p>가입 시 사용한 이메일 주소를 입력해주세요.</p>
                </header>

                <div className={styles.field}>
                  <label htmlFor="finding-password-email" className={styles.label}>
                    이메일 주소
                  </label>
                  <input
                    id="finding-password-email"
                    type="email"
                    className={[styles.input, emailError ? styles.inputError : ''].filter(Boolean).join(' ')}
                    placeholder="user@solarwise.com"
                    value={email}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setEmail(event.target.value)
                      setEmailError('')
                    }}
                  />
                </div>

                <p className={styles.info}>ℹ 가입 시 사용한 이메일로 인증 링크가 발송됩니다.</p>

                {emailError ? (
                  <p className={styles.error} role="alert">
                    {emailError}
                  </p>
                ) : null}

                <button type="submit" className={styles.primaryButton}>
                  인증 메일 발송
                </button>

                <Link to="/login" className={styles.backLink}>
                  ← 로그인으로 돌아가기
                </Link>
              </form>
            ) : null}

            {step === 2 ? (
              <section className={styles.form}>
                <header className={styles.formHeaderCentered}>
                  <div className={styles.successCircle}>✓</div>
                  <h1>메일을 확인해주세요!</h1>
                  <p>
                    {displayEmail} 으로 인증 메일이 발송됐어요.
                    <br />
                    이메일의 링크를 클릭해 비밀번호를 재설정하세요.
                  </p>
                </header>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() =>
                    navigate(
                      `/finding-password/reset?email=${encodeURIComponent(displayEmail)}${resetToken ? `&token=${encodeURIComponent(resetToken)}` : ''}`,
                    )
                  }
                >
                  이메일 앱 열기
                </button>

                <button
                  type="button"
                  className={styles.secondaryTextButton}
                  onClick={() =>
                    navigate(
                      `/finding-password/reset?email=${encodeURIComponent(displayEmail)}${resetToken ? `&token=${encodeURIComponent(resetToken)}` : ''}`,
                    )
                  }
                >
                  인증 메일 링크 열기
                </button>

                <button type="button" className={styles.secondaryTextButton} onClick={() => navigate('/finding-password')}>
                  메일이 오지 않았나요? 재발송하기
                </button>

                <Link to="/login" className={styles.backLink}>
                  ← 로그인으로 돌아가기
                </Link>
              </section>
            ) : null}

            {step === 3 ? (
              <form className={styles.form} onSubmit={handlePasswordSubmit} noValidate>
                <header className={styles.formHeader}>
                  <h1>새 비밀번호 설정</h1>
                  <p>{hasResetToken ? '새로운 비밀번호를 입력해주세요.' : '인증 링크 확인 정보가 없어도 화면 테스트는 가능합니다.'}</p>
                </header>

                <div className={styles.field}>
                  <label htmlFor="new-password" className={styles.label}>
                    새 비밀번호 *
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className={styles.input}
                    placeholder="새 비밀번호를 입력하세요"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value)
                      setPasswordError('')
                    }}
                  />
                  <div className={styles.strengthBars} aria-hidden="true">
                    <span className={strength.bars >= 1 ? styles[`bar${strength.tone}`] : undefined} />
                    <span className={strength.bars >= 2 ? styles[`bar${strength.tone}`] : undefined} />
                    <span className={strength.bars >= 3 ? styles[`bar${strength.tone}`] : undefined} />
                  </div>
                  <p className={[styles.strengthLabel, styles[`strength${strength.tone}`]].join(' ')}>
                    비밀번호 강도: {strength.label}
                  </p>
                </div>

                <div className={styles.field}>
                  <label htmlFor="confirm-password" className={styles.label}>
                    비밀번호 확인 *
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className={styles.input}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      setPasswordError('')
                    }}
                  />
                </div>

                <ul className={styles.ruleList}>
                  <li>{checks.hasLetter ? '●' : '○'} 영문 포함</li>
                  <li>{checks.hasNumber ? '●' : '○'} 숫자 포함</li>
                  <li>{checks.hasSpecial ? '●' : '○'} 특수문자 포함</li>
                  <li>{checks.hasMinLength ? '●' : '○'} 8자 이상</li>
                </ul>

                {passwordError ? (
                  <p className={styles.error} role="alert">
                    {passwordError}
                  </p>
                ) : null}

                <button type="submit" className={styles.primaryButton}>
                  비밀번호 변경 완료
                </button>

                <Link to="/login" className={styles.backLink}>
                  ← 로그인으로 돌아가기
                </Link>
              </form>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  )
}
