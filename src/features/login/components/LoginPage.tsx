import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHideOnScroll } from '@/shared/hooks/useHideOnScroll'
import styles from './LoginPage.module.css'

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
  const isHeaderHidden = useHideOnScroll()
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
    <div className={styles.page}>
      <div className={styles.backgroundBlobLeft} aria-hidden="true" />
      <div className={styles.backgroundBlobTopRight} aria-hidden="true" />
      <div className={styles.backgroundBlobBottomRight} aria-hidden="true" />

      <header className={[styles.header, 'gnb-scroll-header', isHeaderHidden ? 'gnb-scroll-header--hidden' : ''].filter(Boolean).join(' ')}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="SolarWise 홈">
            <span className={styles.brandSun} />
            <span className={styles.brandTextPrimary}>Solar</span>
            <span className={styles.brandTextAccent}>Wise</span>
          </Link>

          <nav className={styles.nav} aria-label="로그인 페이지 메뉴">
            <a href="/#about">서비스 소개</a>
            <Link to="/dashboard">대시보드</Link>
            <a href="/#resources">리소스</a>
            <a href="/#team">팀 소개</a>
          </nav>

          <div className={styles.headerActions}>
            <span className={styles.activeLink}>로그인</span>
            <Link to="/signup" className={styles.headerButton}>
              회원가입
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.cardBrand}>
            <span className={styles.brandSunSmall} />
            <span className={styles.cardBrandPrimary}>Solar</span>
            <span className={styles.cardBrandAccent}>Wise</span>
          </div>

          <header className={styles.formHeader}>
            <h1>로그인</h1>
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
              <div className={styles.passwordWrap}>
                <input
                  id="login-password"
                  type="password"
                  className={[styles.input, styles.passwordInput, errors.password ? styles.inputError : '']
                    .filter(Boolean)
                    .join(' ')}
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={handleChange('password')}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                <span className={styles.passwordIcon} aria-hidden="true">
                  👁
                </span>
              </div>
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
        </section>
      </main>
    </div>
  )
}
