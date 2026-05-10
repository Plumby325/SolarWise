import { apiClient } from './client'
import {
  applyPendingAccountStartFromLogin,
  persistAccountCreatedAtFromApi,
  rememberLastLoginAt,
} from '@/shared/utils/accountCreatedAt'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type UserResponse = {
  userId: number
  name: string
  email: string
  role: string
  /** 백엔드에 필드가 추가되면 자동 반영 (선택) */
  createdAt?: string
}

export type SignupRequest = {
  name: string
  email: string
  password: string
  role: 'OWNER' | 'MANAGER' | 'ADMIN'
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string | null
  user: UserResponse
}

export function signup(request: SignupRequest) {
  return apiClient<ApiResponse<UserResponse>>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function login(request: LoginRequest) {
  return apiClient<ApiResponse<LoginResponse>>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getCurrentUser() {
  return apiClient<ApiResponse<UserResponse>>('/api/v1/users/me')
}

export function saveAuthSession(response: LoginResponse) {
  localStorage.setItem('accessToken', response.accessToken)
  localStorage.setItem('user', JSON.stringify(response.user))
  applyPendingAccountStartFromLogin(response.user.userId, response.user.email)
  if (response.user.createdAt) {
    persistAccountCreatedAtFromApi(response.user.userId, response.user.createdAt)
  }
  rememberLastLoginAt()
  window.dispatchEvent(new Event('solarwise-auth-change'))
}
