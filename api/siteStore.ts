import { attendanceRecords as demoAttendance, dailyLogs as demoDailyLogs } from '../src/data.js'
import type { AttendanceRecord, DailyLog } from '../src/types.js'
import { readCollection, updateCollection } from './jsonStore.js'

export async function listDailyLogs(projectIds: string[]): Promise<DailyLog[]> {
  const logs = await readCollection('daily-logs.json', demoDailyLogs)
  return logs.filter(log => projectIds.includes(log.projectId))
}

export async function insertDailyLog(log: DailyLog): Promise<void> {
  await updateCollection('daily-logs.json', demoDailyLogs, logs => [log, ...logs])
}

export async function listAttendance(projectIds: string[], date?: string): Promise<AttendanceRecord[]> {
  const records = await readCollection('attendance.json', demoAttendance)
  return records.filter(record => projectIds.includes(record.projectId) && (!date || record.date === date))
}

export async function replaceAttendanceDay(projectId: string, date: string, entries: AttendanceRecord[]): Promise<void> {
  await updateCollection('attendance.json', demoAttendance, records => [
    ...records.filter(record => !(record.projectId === projectId && record.date === date)),
    ...entries,
  ])
}
