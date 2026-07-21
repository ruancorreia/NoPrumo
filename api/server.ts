import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { findProject, insertProject, listProjects, type StoredProject } from './projectStore.js'
import { insertDailyLog, listAttendance, listDailyLogs, replaceAttendanceDay } from './siteStore.js'
import type { AttendanceRecord, DailyLog, Project, ProjectStatus } from '../src/types.js'

type UserRole = 'admin' | 'engineer' | 'foreman' | 'client'

interface DemoUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
  organizationId: string
}

interface AuthenticatedRequest extends Request {
  user?: Omit<DemoUser, 'passwordHash'>
}

const app = express()
const port = Number(process.env.API_PORT ?? 3001)
const jwtSecret = process.env.JWT_SECRET ?? 'noprumo-local-development-secret'

app.use(cors({ origin: 'http://127.0.0.1:5173' }))
app.use(express.json({ limit: '8mb' }))

const publicUser = ({ passwordHash: _passwordHash, ...user }: DemoUser) => user

async function createDemoUsers(): Promise<DemoUser[]> {
  return [
    {
      id: 'usr-admin-01',
      name: 'Ruan Correia',
      email: 'admin@noprumo.local',
      passwordHash: await bcrypt.hash('noprumo123', 10),
      role: 'admin',
      organizationId: 'org-noprumo-demo',
    },
  ]
}

function authenticate(users: DemoUser[]) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return response.status(401).json({ message: 'Sessão não informada.' })

    try {
      const payload = jwt.verify(token, jwtSecret) as { sub: string }
      const user = users.find(item => item.id === payload.sub)
      if (!user) return response.status(401).json({ message: 'Sessão inválida.' })
      request.user = publicUser(user)
      next()
    } catch {
      return response.status(401).json({ message: 'Sessão expirada ou inválida.' })
    }
  }
}

async function start() {
  const users = await createDemoUsers()
  const requireAuth = authenticate(users)

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'noprumo-api' })
  })

  app.post('/api/auth/login', async (request, response) => {
    const email = String(request.body?.email ?? '').trim().toLocaleLowerCase('pt-BR')
    const password = String(request.body?.password ?? '')
    const user = users.find(item => item.email === email)

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ message: 'E-mail ou senha inválidos.' })
    }

    const token = jwt.sign({ sub: user.id, role: user.role, organizationId: user.organizationId }, jwtSecret, { expiresIn: '8h' })
    return response.json({ token, user: publicUser(user) })
  })

  app.get('/api/auth/me', requireAuth, (request: AuthenticatedRequest, response) => {
    response.json({ user: request.user })
  })

  app.get('/api/projects', requireAuth, async (request: AuthenticatedRequest, response) => {
    const organizationId = request.user!.organizationId
    response.json({ projects: await listProjects(organizationId) })
  })

  app.post('/api/projects', requireAuth, async (request: AuthenticatedRequest, response) => {
    if (request.user?.role !== 'admin') return response.status(403).json({ message: 'Seu perfil não pode cadastrar obras.' })

    const input = request.body as Partial<Project>
    if (!input.name?.trim() || !input.location?.trim() || !input.manager?.trim() || !input.startDate || !input.endDate) {
      return response.status(400).json({ message: 'Preencha as informações obrigatórias da obra.' })
    }

    const project: StoredProject = {
      id: `obra-${randomUUID()}`,
      name: input.name.trim(),
      location: input.location.trim(),
      manager: input.manager.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      stage: input.stage?.trim() || 'Planejamento',
      progress: Number(input.progress ?? 0),
      scheduleProgress: Number(input.scheduleProgress ?? 0),
      invested: Number(input.invested ?? 0),
      marketValue: Number(input.marketValue ?? 0),
      spent: Number(input.spent ?? 0),
      budget: Number(input.budget ?? 0),
      status: (input.status ?? 'No prazo') as ProjectStatus,
      nextMilestone: input.nextMilestone?.trim() || 'Mobilização do canteiro',
      milestoneDate: input.milestoneDate?.trim() || '',
      team: Number(input.team ?? 0),
      organizationId: request.user.organizationId,
      createdAt: new Date().toISOString(),
    }

    await insertProject(project)
    return response.status(201).json({ project })
  })

  app.get('/api/daily-logs', requireAuth, async (request: AuthenticatedRequest, response) => {
    const projectIds = (await listProjects(request.user!.organizationId)).map(project => project.id)
    response.json({ dailyLogs: await listDailyLogs(projectIds) })
  })

  app.post('/api/projects/:projectId/daily-logs', requireAuth, async (request: AuthenticatedRequest, response) => {
    const projectId = String(request.params.projectId)
    const project = await findProject(projectId, request.user!.organizationId)
    if (!project) return response.status(404).json({ message: 'Obra não encontrada.' })

    const input = request.body as Partial<DailyLog>
    if (!input.date || !input.activities?.length) return response.status(400).json({ message: 'Informe a data e ao menos uma atividade.' })

    const dailyLog: DailyLog = {
      id: `rdo-${randomUUID()}`,
      projectId: project.id,
      date: input.date,
      weather: input.weather ?? 'Ensolarado',
      temperature: Number(input.temperature ?? 0),
      teamCount: Number(input.teamCount ?? 0),
      activities: input.activities.map(activity => String(activity).trim()).filter(Boolean),
      notes: String(input.notes ?? '').trim(),
      occurrences: String(input.occurrences ?? '').trim(),
      author: request.user!.name,
      createdAt: new Date().toISOString(),
      photos: Array.isArray(input.photos) ? input.photos.slice(0, 4) : [],
    }
    await insertDailyLog(dailyLog)
    return response.status(201).json({ dailyLog })
  })

  app.get('/api/attendance', requireAuth, async (request: AuthenticatedRequest, response) => {
    const projectIds = (await listProjects(request.user!.organizationId)).map(project => project.id)
    const date = typeof request.query.date === 'string' ? request.query.date : undefined
    response.json({ attendance: await listAttendance(projectIds, date) })
  })

  app.put('/api/projects/:projectId/attendance/:date', requireAuth, async (request: AuthenticatedRequest, response) => {
    const projectId = String(request.params.projectId)
    const date = String(request.params.date)
    const project = await findProject(projectId, request.user!.organizationId)
    if (!project) return response.status(404).json({ message: 'Obra não encontrada.' })

    const inputEntries = Array.isArray(request.body?.entries) ? request.body.entries as Partial<AttendanceRecord>[] : []
    const entries: AttendanceRecord[] = inputEntries
      .filter(entry => entry.memberId && entry.status)
      .map(entry => ({
        id: `pres-${randomUUID()}`,
        projectId: project.id,
        memberId: String(entry.memberId),
        date,
        status: entry.status!,
        checkIn: String(entry.checkIn ?? ''),
        checkOut: String(entry.checkOut ?? ''),
        note: String(entry.note ?? '').trim(),
      }))
    await replaceAttendanceDay(project.id, date, entries)
    return response.json({ attendance: entries })
  })

  app.listen(port, '127.0.0.1', () => {
    console.log(`NoPrumo API disponível em http://127.0.0.1:${port}`)
  })
}

start().catch(error => {
  console.error('Falha ao iniciar a API do NoPrumo.', error)
  process.exitCode = 1
})
