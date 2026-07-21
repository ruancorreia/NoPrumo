import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projects as demoProjects } from '../src/data.js'
import type { Project } from '../src/types.js'

export interface StoredProject extends Project {
  organizationId: string
  createdAt: string
}

const storePath = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'projects.json')
let writeQueue = Promise.resolve()

const legacyMockLocations: Record<string, string> = {
  'Campinas, SP': 'Niterói, RJ',
  'Valinhos, SP': 'Rio de Janeiro, RJ',
  'Jundiaí, SP': 'Niterói, RJ',
  'Indaiatuba, SP': 'Rio de Janeiro, RJ',
}

function seedProjects(): StoredProject[] {
  return demoProjects.map(project => ({
    ...project,
    organizationId: 'org-noprumo-demo',
    createdAt: '2026-07-20T12:00:00-03:00',
  }))
}

async function ensureStore() {
  await mkdir(dirname(storePath), { recursive: true })
  try {
    await readFile(storePath, 'utf8')
  } catch {
    await writeFile(storePath, JSON.stringify(seedProjects(), null, 2), 'utf8')
  }
}

export async function listProjects(organizationId: string): Promise<StoredProject[]> {
  await ensureStore()
  const storedProjects = JSON.parse(await readFile(storePath, 'utf8')) as StoredProject[]
  const projects = storedProjects.map(project => ({
    ...project,
    location: legacyMockLocations[project.location] ?? project.location,
    nextMilestone: project.nextMilestone.replace('Mobiliza��o', 'Mobilização'),
  }))
  if (projects.some((project, index) => project.location !== storedProjects[index].location || project.nextMilestone !== storedProjects[index].nextMilestone)) {
    await writeFile(storePath, JSON.stringify(projects, null, 2), 'utf8')
  }
  return projects.filter(project => project.organizationId === organizationId)
}

export async function findProject(projectId: string, organizationId: string): Promise<StoredProject | undefined> {
  return (await listProjects(organizationId)).find(project => project.id === projectId)
}

export async function insertProject(project: StoredProject): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await ensureStore()
    const projects = JSON.parse(await readFile(storePath, 'utf8')) as StoredProject[]
    projects.unshift(project)
    await writeFile(storePath, JSON.stringify(projects, null, 2), 'utf8')
  })
  await writeQueue
}
