export function loadCollection<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key)
    const parsed = saved ? JSON.parse(saved) as T[] : null
    return parsed?.length ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveCollection<T>(key: string, items: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

export const storageKeys = {
  projects: 'noprumo.projects',
  dailyLogs: 'noprumo.dailyLogs',
  attendance: 'noprumo.attendance',
} as const
