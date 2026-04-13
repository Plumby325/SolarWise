import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

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

type FormState = {
  email: string
  password: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const initialForm: FormState = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange =
    (field: keyof FormState) =>
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
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!form.email.includes('@')) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.'
    }

    if (!form.password.trim()) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      navigate('/')
    }
  }

  const handleSocialLogin = () => {
    navigate('/')
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandInner}>
          <Link to="/" className={styles.brandBadge}>
            <span className={styles.brandMark}>☀</span>
            <span>SolarWise</span>
          </Link>

          <span className={styles.welcomeBadge}>다시 오셨군요!</span>

          <div className={styles.heroBlock}>
            <h1 className={styles.heroTitle}>
              <span>AI가 지키는</span>
              <span>당신의 발전소</span>
            </h1>
          </div>

          <p className={styles.heroDescription}>
            실시간 발전량 트래킹부터 AI 결함 감지, 예측까지 SolarWise 하나로.
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
            <h2>로그인</h2>
            <p>다시 오셨군요, 반갑습니다 👋</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="login-email" className={styles.label}>
                이메일
              </label>
              <input
                id="login-email"
                type="email"
                className={[styles.input, errors.email ? styles.inputError : ''].filter(Boolean).join(' ')}
                placeholder="user@solarwise.com"
                value={form.email}
                onChange={handleChange('email')}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email ? (
                <p id="login-email-error" className={styles.error} role="alert">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="login-password"
                type="password"
                className={[styles.input, errors.password ? styles.inputError : ''].filter(Boolean).join(' ')}
                placeholder="비밀번호를 입력하세요"
                value={form.password}
                onChange={handleChange('password')}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              {errors.password ? (
                <p id="login-password-error" className={styles.error} role="alert">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div className={styles.supportRow}>
              <a href="/" onClick={(event: { preventDefault(): void }) => event.preventDefault()}>
                비밀번호를 잊으셨나요?
              </a>
            </div>

            <button type="submit" className={styles.primaryButton}>
              로그인
            </button>
          </form>

          <div className={styles.divider} aria-hidden="true">
            <span />
            <p>또는 소셜 계정으로 로그인</p>
            <span />
          </div>

          <div className={styles.socialActions}>
            <button type="button" className={styles.googleButton} onClick={handleSocialLogin}>
              G&nbsp;&nbsp;Google로 로그인
            </button>
            <button type="button" className={styles.kakaoButton} onClick={handleSocialLogin}>
              카카오로 로그인
            </button>
          </div>

          <p className={styles.signupRow}>
            <span>아직 계정이 없으신가요?</span>
            <Link to="/signup">무료 회원가입하기 →</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
