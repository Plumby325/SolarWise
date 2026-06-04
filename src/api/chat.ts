import { apiClient } from './client'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type ChatSession = {
  sessionId: number
  sessionTitle: string
  plantId: number
  updatedAt: string
}

export type ChatMessage = {
  messageId: number
  senderRole: 'USER' | 'AI' | string
  content: string
  imageUrl: string | null
  createdAt: string
}

export type SendChatMessageBody = {
  senderRole: 'USER'
  content: string
  imageUrl?: string | null
}

export function createChatSession(plantId: number, sessionTitle: string) {
  const params = new URLSearchParams({ sessionTitle })
  return apiClient<ApiResponse<ChatSession>>(`/api/v1/plants/${plantId}/chat/sessions?${params.toString()}`, {
    method: 'POST',
  })
}

export function getChatSessions(plantId: number) {
  return apiClient<ApiResponse<ChatSession[]>>(`/api/v1/plants/${plantId}/chat/sessions`)
}

export function getChatMessages(plantId: number, sessionId: number) {
  return apiClient<ApiResponse<ChatMessage[]>>(`/api/v1/plants/${plantId}/chat/sessions/${sessionId}/messages`)
}

export function sendChatMessage(plantId: number, sessionId: number, body: SendChatMessageBody) {
  return apiClient<ApiResponse<ChatMessage>>(`/api/v1/plants/${plantId}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
