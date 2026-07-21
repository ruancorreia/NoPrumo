import type { AttendanceRecord, DailyLog } from '../types'

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { message?: string }
  if (!response.ok) throw new Error(body.message ?? 'Não foi possível sincronizar os dados do canteiro.')
  return body
}

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function listDailyLogsRequest(token: string): Promise<DailyLog[]> {
  const response = await fetch('/api/daily-logs', { headers: authHeaders(token) })
  return (await parseResponse<{ dailyLogs: DailyLog[] }>(response)).dailyLogs
}

export async function createDailyLogRequest(token: string, log: DailyLog): Promise<DailyLog> {
  const response = await fetch(`/api/projects/${encodeURIComponent(log.projectId)}/daily-logs`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  })
  return (await parseResponse<{ dailyLog: DailyLog }>(response)).dailyLog
}

export async function listAttendanceRequest(token: string): Promise<AttendanceRecord[]> {
  const response = await fetch('/api/attendance', { headers: authHeaders(token) })
  return (await parseResponse<{ attendance: AttendanceRecord[] }>(response)).attendance
}

export async function saveAttendanceRequest(token: string, projectId: string, date: string, entries: AttendanceRecord[]): Promise<AttendanceRecord[]> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/attendance/${encodeURIComponent(date)}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries }),
  })
  return (await parseResponse<{ attendance: AttendanceRecord[] }>(response)).attendance
}
