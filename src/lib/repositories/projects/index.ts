import { prisma } from '@/lib/prisma'
import type { Project } from '@/types'

function toProject(row: {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}): Project {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(toProject)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const row = await prisma.project.findUnique({ where: { id } })
  return row ? toProject(row) : null
}

export async function createProject(name: string): Promise<Project> {
  const row = await prisma.project.create({ data: { name } })
  return toProject(row)
}

export async function updateProject(
  id: string,
  data: { name?: string }
): Promise<Project> {
  const row = await prisma.project.update({
    where: { id },
    data,
  })
  return toProject(row)
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.delete({ where: { id } })
}
