'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { EditableTitle } from '@/components/ui/EditableTitle'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/types'
import styles from './styles.module.scss'

interface ProjectRowProps {
  project: Project
  onUpdate: (id: string, data: { name: string }) => void
  onDelete: (id: string) => void
}

export function ProjectRow({ project, onUpdate, onDelete }: ProjectRowProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [copied, setCopied] = useState(false)

  const openProject = useCallback(() => {
    router.push(`/projects/${project.id}`)
  }, [router, project.id])

  const handleSave = useCallback(
    (name: string) => {
      onUpdate(project.id, { name })
    },
    [project.id, onUpdate]
  )

  const handleShare = useCallback(async () => {
    const link = `${window.location.origin}/projects/${project.id}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback handled silently
    }
  }, [project.id])

  const handleDeleteConfirm = useCallback(async () => {
    setRemoving(true)
    await new Promise((r) => setTimeout(r, 220))
    onDelete(project.id)
  }, [project.id, onDelete])

  const rowClasses = [
    styles['project-row'],
    removing ? styles['project-row--removing'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  const actionsClasses = [
    styles['project-actions'],
    confirming ? styles['project-actions--confirming'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rowClasses} onClick={openProject} role="link" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') openProject() }}
    >
      <EditableTitle
        value={project.name}
        onSave={handleSave}
        className={styles['project-title']}
      />
      <div
        className={actionsClasses}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {!confirming && (
          <>
            <Button onClick={openProject}>Open project</Button>
            <Button
              variant="icon"
              onClick={() => setConfirming(true)}
              aria-label="Delete project"
            >
              &times;
            </Button>
            <Button
              variant="icon"
              onClick={handleShare}
              aria-label="Copy share link"
              disabled={copied}
              className={copied ? styles['share-button--copied'] : ''}
            >
              {copied ? 'Link copied' : '\u2197'}
            </Button>
          </>
        )}
        {confirming && (
          <div className={styles['confirm-delete']}>
            <span className={styles['confirm-delete-text']}>Are you sure?</span>
            <Button onClick={handleDeleteConfirm}>Yes</Button>
            <Button onClick={() => setConfirming(false)}>No</Button>
          </div>
        )}
      </div>
    </div>
  )
}
