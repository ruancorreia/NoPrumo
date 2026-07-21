import type { Role } from '../types'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  organizationId: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Não foi possível concluir a solicitação.')
  return body
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return parseResponse<AuthResponse>(response)
}

export async function currentUserRequest(token: string): Promise<AuthUser> {
  const response = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await parseResponse<{ user: AuthUser }>(response)
  return body.user
}
