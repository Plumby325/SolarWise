const PENDING_KEY = 'solarwise-pending-account-start'

export function rememberSignupForAccountStart(email: string) {
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ email: email.trim().toLowerCase(), at: new Date().toISOString() }),
  )
}

function storageKeyForUser(userId: number) {
  return `solarwise-account-created-at:${userId}`
}

/**
 * 로그인 직후: 방금 가입한 이메일이면 가입 시각을 이 계정에 고정 저장합니다.
 */
export function applyPendingAccountStartFromLogin(userId: number, email: string) {
  const raw = localStorage.getItem(PENDING_KEY)
  if (!raw) {
    return
  }

  try {
    const parsed = JSON.parse(raw) as { email?: string; at?: string }
    if (
      parsed.email &&
      parsed.at &&
      userId > 0 &&
      parsed.email.toLowerCase() === email.trim().toLowerCase()
    ) {
      localStorage.setItem(storageKeyForUser(userId), parsed.at)
      localStorage.removeItem(PENDING_KEY)
    }
  } catch {
    /* ignore */
  }
}

export function persistAccountCreatedAtFromApi(userId: number, isoDateTime: string) {
  if (userId > 0 && isoDateTime.trim()) {
    localStorage.setItem(storageKeyForUser(userId), isoDateTime.trim())
  }
}

export function getStoredAccountCreatedAtIso(userId: number | undefined): string | null {
  if (userId == null || userId <= 0) {
    return null
  }

  return localStorage.getItem(storageKeyForUser(userId))
}

export const LAST_LOGIN_STORAGE_KEY = 'solarwise-last-login-at'

export function rememberLastLoginAt() {
  localStorage.setItem(LAST_LOGIN_STORAGE_KEY, new Date().toISOString())
}

export function getLastLoginAtIso(): string | null {
  return localStorage.getItem(LAST_LOGIN_STORAGE_KEY)
}
