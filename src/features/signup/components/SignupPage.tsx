import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '@/api'
import { SiteHeader } from '@/shared/layout/SiteHeader'
import styles from './SignupPage.module.css'

const highlights = [
  '실시간 발전량 트래킹',
  'AI 발전량 예측 (2~3일)',
  'AI 패널 이상 감지',
  'XAI 설명 리포트',
  '예지 정비 알림',
] as const

const stats = [
  { value: '1,240+', label: '연동 발전소' },
  { value: '94.7%', label: 'AI 정확도' },
  { value: '무료', label: '회원가입' },
] as const

const ownershipOptions = [
  { id: 'owned', label: '보유 중' },
  { id: 'planned', label: '준비 중' },
  { id: 'none', label: '없음' },
] as const

type OwnershipOption = (typeof ownershipOptions)[number]['id']

type FormState = {
  name: string
  email: string
  password: string
  ownership: OwnershipOption
}

type FormErrors = Partial<Record<'name' | 'email' | 'password', string>>

const initialForm: FormState = {
  name: '',
  email: '',
  password: '',
  ownership: 'owned',
}

export function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: 'name' | 'email' | 'password') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value

      setForm((current) => ({
        ...current,
        [field]: nextValue,
      }))

      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
      setSubmitError('')
    }

  const handleOwnershipChange = (ownership: OwnershipOption) => {
    setForm((current) => ({
      ...current,
      ownership,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = '이름을 입력해 주세요.'
    }

    if (!form.email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!form.email.includes('@')) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.'
    }

    if (!form.password.trim()) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    } else if (form.password.trim().length < 8) {
      nextErrors.password = '비밀번호는 8자 이상으로 입력해 주세요.'
    }

    setErrors(nextErrors)
    setSubmitError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSubmitting(true)
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: 'OWNER',
      })
      navigate('/login')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialStart = () => {
    navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      <SiteHeader active="signup" ariaLabel="회원가입 페이지 메뉴" />

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

            <div className={styles.welcomeBadge}>
              <span className={styles.welcomeDot} />
              무료 · 신용카드 불필요
            </div>

            <h1 className={styles.heroTitle}>
              <span>지금 바로 시작하세요.</span>
              <span>발전소 관리가</span>
              <span className={styles.heroTitleAccent}>달라집니다.</span>
            </h1>

            <p className={styles.heroDescription}>
              회원가입만으로 5가지 AI 기능을 모두 무료로 이용할 수 있습니다.
            </p>

            <ul className={styles.highlightList} aria-label="서비스 핵심 기능">
              {highlights.map((item) => (
                <li key={item} className={styles.highlightItem}>
                  <span className={styles.checkIcon} aria-hidden="true">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className={styles.statsGrid}>
              {stats.map((item) => (
                <article key={item.label} className={styles.statCard}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <header className={styles.formHeader}>
              <h1>회원가입</h1>
              <p>지금 바로 시작하세요. 신용카드 불필요.</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="signup-name" className={styles.label}>
                  이름
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className={[styles.input, errors.name ? styles.inputError : ''].filter(Boolean).join(' ')}
                  placeholder="홍길동"
                  value={form.name}
                  onChange={handleChange('name')}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'signup-name-error' : undefined}
                />
                {errors.name ? (
                  <p id="signup-name-error" className={styles.error} role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className={styles.field}>
                <label htmlFor="signup-email" className={styles.label}>
                  이메일
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className={[styles.input, errors.email ? styles.inputError : ''].filter(Boolean).join(' ')}
                  placeholder="user@solarwise.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'signup-email-error' : undefined}
                />
                {errors.email ? (
                  <p id="signup-email-error" className={styles.error} role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className={styles.field}>
                <label htmlFor="signup-password" className={styles.label}>
                  비밀번호
                </label>
                <div className={styles.passwordWrap}>
                  <input
                    id="signup-password"
                    type="password"
                    className={[styles.input, styles.passwordInput, errors.password ? styles.inputError : '']
                      .filter(Boolean)
                      .join(' ')}
                    placeholder="Password123!"
                    value={form.password}
                    onChange={handleChange('password')}
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={errors.password ? 'signup-password-error' : undefined}
                  />
                  <span className={styles.passwordIcon} aria-hidden="true">
                    👁
                  </span>
                </div>
                {errors.password ? (
                  <p id="signup-password-error" className={styles.error} role="alert">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>발전소 보유 여부 (선택)</span>
                <div className={styles.ownershipGrid} role="group" aria-label="발전소 보유 여부">
                  {ownershipOptions.map((option) => {
                    const isSelected = form.ownership === option.id

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={[styles.ownershipButton, isSelected ? styles.ownershipButtonSelected : '']
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => handleOwnershipChange(option.id)}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? '●' : '○'} {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {submitError ? (
                <p className={styles.error} role="alert">
                  {submitError}
                </p>
              ) : null}

              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? '가입 중...' : '무료로 시작하기 →'}
              </button>
            </form>

            <div className={styles.divider} aria-hidden="true">
              <span />
              <p>또는 소셜 계정으로 시작하기</p>
              <span />
            </div>

            <div className={styles.socialActions}>
              <button type="button" className={styles.googleButton} onClick={handleSocialStart}>
                G&nbsp;&nbsp;Google로 시작하기
              </button>
              <button type="button" className={styles.kakaoButton} onClick={handleSocialStart}>
                카카오로 시작하기
              </button>
            </div>

            <p className={styles.loginRow}>
              <span>이미 계정이 있으신가요?</span>
              <Link to="/login">로그인하기 →</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
