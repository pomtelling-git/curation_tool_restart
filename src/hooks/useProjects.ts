'use client'

import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import type { Project } from '@/types'

export function useProjects() {
  const projects = useStore((s) => s.projects)
  const setProjects = useStore((s) => s.setProjects)
  const addProject = useStore((s) => s.addProject)
  const updateProjectInStore = useStore((s) => s.updateProject)
  const removeProject = useStore((s) => s.removeProject)
  const showToast = useStore((s) => s.showToast)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data: Project[] = await res.json()
      setProjects(data)
    } catch {
      showToast('Failed to load projects', 'error')
    }
  }, [setProjects, showToast])

  const createProject = useCallback(
    async (name?: string): Promise<Project | null> => {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            typeof data?.detail === 'string'
              ? data.detail
              : data?.error ?? 'Failed to create project'
          throw new Error(msg)
        }
        const project = data as Project
        addProject(project)
        return project
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not create project'
        showToast(message, 'error')
        return null
      }
    },
    [addProject, showToast]
  )

  const updateProject = useCallback(
    async (id: string, data: { name?: string }) => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update project')
        const project: Project = await res.json()
        updateProjectInStore(id, project)
      } catch {
        showToast('Could not update project', 'error')
      }
    },
    [updateProjectInStore, showToast]
  )

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete project')
        removeProject(id)
      } catch {
        showToast('Could not delete project', 'error')
      }
    },
    [removeProject, showToast]
  )

  return {
    projects,
    setProjects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
