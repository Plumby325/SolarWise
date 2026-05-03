import { apiClient } from './client'

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

export function saveAuthSession(response: LoginResponse) {
  localStorage.setItem('accessToken', response.accessToken)
  localStorage.setItem('user', JSON.stringify(response.user))
  window.dispatchEvent(new Event('solarwise-auth-change'))
}
