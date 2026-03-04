'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import { ProjectRow } from './ProjectRow'
import styles from './styles.module.scss'

export function ProjectList() {
  const router = useRouter()
  const { projects, fetchProjects, createProject, updateProject, deleteProject } =
    useProjects()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreate = async () => {
    const project = await createProject()
    if (project) {
      router.push(`/projects/${project.id}`)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Projects</span>
        <Button onClick={handleCreate}>New project</Button>
      </div>
      <div className={styles.list}>
        {projects.length === 0 ? (
          <p className={styles.empty}>No pages yet.</p>
        ) : (
          projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onUpdate={updateProject}
              onDelete={deleteProject}
            />
          ))
        )}
      </div>
    </div>
  )
}
