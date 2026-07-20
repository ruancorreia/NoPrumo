export type Role = 'admin' | 'engineer' | 'foreman' | 'client'

export type ProjectStatus = 'No prazo' | 'Atenção' | 'Atrasada'

export interface Project {
  id: string
  name: string
  location: string
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
