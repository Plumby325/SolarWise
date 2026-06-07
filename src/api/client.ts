export async function apiClient<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem('accessToken')

  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const rawMessage =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : typeof errorBody?.error?.message === 'string'
          ? errorBody.error.message
          : `API request failed: ${response.status}`
    const message = `[${response.status}] ${rawMessage}`

    throw new Error(message)
  }

  return response.json() as Promise<T>
}
