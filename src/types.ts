export type Role = 'admin' | 'engineer' | 'foreman' | 'client'

export type ProjectStatus = 'No prazo' | 'Atenção' | 'Atrasada'

export interface Project {
  id: string
  name: string
  location: string
  manager: string
  startDate: string
  endDate: string
  stage: string
  progress: number
  scheduleProgress: number
  invested: number
  marketValue: number
  spent: number
  budget: number
  status: ProjectStatus
  nextMilestone: string
  milestoneDate: string
  team: number
}

export interface AlertItem {
  id: number
  projectId: string
  level: 'critical' | 'warning' | 'info'
  title: string
  description: string
  age: string
}

export interface Order {
  id: string
  projectId: string
  item: string
  supplier: string
  value: number
  status: 'Pendente' | 'Cotado' | 'Aprovado' | 'Em trânsito' | 'Recebido'
  date: string
}

export interface DailyLogPhoto {
  id: string
  name: string
  dataUrl?: string
  theme?: 'masonry' | 'structure' | 'installation' | 'finishing'
}

export interface DailyLog {
  id: string
  projectId: string
  date: string
  weather: 'Ensolarado' | 'Parcialmente nublado' | 'Chuvoso'
  temperature: number
  teamCount: number
  activities: string[]
  notes: string
  occurrences: string
  author: string
  createdAt: string
  photos: DailyLogPhoto[]
}

export interface TeamMember {
  id: string
  projectId: string
  name: string
  role: string
  employmentType: 'Próprio' | 'Terceirizado'
  company?: string
}

export type AttendanceStatus = 'Presente' | 'Ausente' | 'Meio período'

export interface AttendanceRecord {
  id: string
  projectId: string
  memberId: string
  date: string
  status: AttendanceStatus
  checkIn: string
  checkOut: string
  note: string
}
