import type { Project } from '../types'

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Não foi possível carregar as obras.')
  return body
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function listProjectsRequest(token: string): Promise<Project[]> {
  const response = await fetch('/api/projects', { headers: authHeaders(token) })
  const body = await parseResponse<{ projects: Project[] }>(response)
  return body.projects
}

export async function createProjectRequest(token: string, project: Project): Promise<Project> {
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  })
  const body = await parseResponse<{ project: Project }>(response)
  return body.project
}
