import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDirectory = resolve(dirname(fileURLToPath(import.meta.url)), 'data')
const queues = new Map<string, Promise<void>>()

async function ensureCollection<T>(filename: string, seed: T[]) {
  const path = resolve(dataDirectory, filename)
  await mkdir(dirname(path), { recursive: true })
  try {
    await readFile(path, 'utf8')
  } catch {
    await writeFile(path, JSON.stringify(seed, null, 2), 'utf8')
  }
  return path
}

export async function readCollection<T>(filename: string, seed: T[]): Promise<T[]> {
  const path = await ensureCollection(filename, seed)
  return JSON.parse(await readFile(path, 'utf8')) as T[]
}

export async function updateCollection<T>(filename: string, seed: T[], update: (items: T[]) => T[]): Promise<T[]> {
  const previous = queues.get(filename) ?? Promise.resolve()
  let result: T[] = []
  const current = previous.then(async () => {
    const path = await ensureCollection(filename, seed)
    const items = JSON.parse(await readFile(path, 'utf8')) as T[]
    result = update(items)
    await writeFile(path, JSON.stringify(result, null, 2), 'utf8')
  })
  queues.set(filename, current)
  await current
  return result
}
