export type SessionUser = {
  userId?: number
  name: string
  email: string
  role: string
}

const defaultSessionUser: SessionUser = {
  name: '사용자',
  email: 'user@solarwise.com',
  role: 'OWNER',
}

function parseStoredUser(): Partial<SessionUser> | null {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    const user = JSON.parse(storedUser) as {
      userId?: unknown
      name?: unknown
      email?: unknown
      role?: unknown
    }

    return {
      userId: typeof user.userId === 'number' ? user.userId : undefined,
      name: typeof user.name === 'string' ? user.name.trim() : undefined,
      email: typeof user.email === 'string' ? user.email.trim() : undefined,
      role: typeof user.role === 'string' ? user.role.trim() : undefined,
    }
  } catch {
    return null
  }
}

export function getSessionUser(fallback: SessionUser = defaultSessionUser): SessionUser {
  const storedUser = parseStoredUser()

  if (!storedUser) {
    return fallback
  }

  return {
    userId: storedUser.userId,
    name: storedUser.name || fallback.name,
    email: storedUser.email || fallback.email,
    role: storedUser.role || fallback.role,
  }
}

export function getAuthenticatedSessionUser() {
  if (!localStorage.getItem('accessToken')) {
    return null
  }

  return getSessionUser()
}

export function getSessionUserDisplayName(user = getSessionUser()) {
  return user.name || user.email || defaultSessionUser.name
}

export function getSessionUserRoleLabel(role: string) {
  if (role === 'OWNER') {
    return '발전소 관리자'
  }

  if (role === 'MANAGER') {
    return '발전소 관리자'
  }

  if (role === 'ADMIN') {
    return '시스템 관리자'
  }

  return role || '발전소 관리자'
}

export function formatSessionUserRole(role: string) {
  if (role === 'OWNER') {
    return 'OWNER (발전소 소유자)'
  }

  if (role === 'MANAGER') {
    return 'MANAGER (발전소 관리자)'
  }

  if (role === 'ADMIN') {
    return 'ADMIN (시스템 관리자)'
  }

  return role
}

export function clearAuthSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('solarwise-auth-change'))
}
