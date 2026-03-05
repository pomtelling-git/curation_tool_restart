'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import { Button } from '@/components/ui/Button'
import { ProjectRow } from './ProjectRow'
import type { Project } from '@/types'
import styles from './styles.module.scss'

interface ProjectListProps {
  initialProjects?: Project[]
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter()
  const { projects, setProjects, fetchProjects, createProject, updateProject, deleteProject } =
    useProjects()

  useEffect(() => {
    if (initialProjects?.length !== undefined && initialProjects.length > 0) {
      setProjects(initialProjects)
    } else {
      fetchProjects()
    }
  }, [initialProjects, setProjects, fetchProjects])

  const projectsToShow = initialProjects?.length ? initialProjects : projects

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
        {projectsToShow.length === 0 ? (
          <p className={styles.empty}>No pages yet.</p>
        ) : (
          projectsToShow.map((project) => (
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
