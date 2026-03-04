import * as projectRepo from '@/lib/repositories/projects'
import { deleteProjectFiles } from '@/lib/storage'
import type { Project } from '@/types'

const DEFAULT_NAME = 'Untitled project'

export async function listProjects(): Promise<Project[]> {
  return projectRepo.getProjects()
}

export async function getProject(id: string): Promise<Project | null> {
  return projectRepo.getProjectById(id)
}

export async function createProject(name?: string): Promise<Project> {
  const projectName = name?.trim() || DEFAULT_NAME
  return projectRepo.createProject(projectName)
}

export async function updateProject(
  id: string,
  data: { name?: string }
): Promise<Project> {
  const updates: { name?: string } = {}
  if (data.name !== undefined) {
    updates.name = data.name.trim() || DEFAULT_NAME
  }
  return projectRepo.updateProject(id, updates)
}

export async function deleteProject(id: string): Promise<void> {
  await deleteProjectFiles(id)
  await projectRepo.deleteProject(id)
}
