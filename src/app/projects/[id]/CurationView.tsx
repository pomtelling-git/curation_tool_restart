'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { useAssets } from '@/hooks/useAssets'
import { EditableTitle } from '@/components/ui/EditableTitle'
import { Button } from '@/components/ui/Button'
import { DropZone } from '@/components/DropZone'
import { Gallery } from '@/components/Gallery'
import type { Project } from '@/types'
import styles from './styles.module.scss'

interface CurationViewProps {
  projectId: string
}

export function CurationView({ projectId }: CurationViewProps) {
  const router = useRouter()
  const currentProject = useStore((s) => s.currentProject)
  const setCurrentProject = useStore((s) => s.setCurrentProject)
  const updateProjectInStore = useStore((s) => s.updateProject)
  const showToast = useStore((s) => s.showToast)
  const { assets, fetchAssets, uploadFiles, deleteAsset, reorderAssets } =
    useAssets(projectId)

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (!res.ok) throw new Error('Project not found')
        const project: Project = await res.json()
        setCurrentProject(project)
      } catch {
        showToast('Could not load project', 'error')
      }
    }

    loadProject()
    fetchAssets()

    return () => {
      setCurrentProject(null)
    }
  }, [projectId, setCurrentProject, fetchAssets, showToast])

  const handleTitleSave = useCallback(
    async (name: string) => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) throw new Error('Update failed')
        const updated: Project = await res.json()
        updateProjectInStore(projectId, updated)
      } catch {
        showToast('Could not update project name', 'error')
      }
    },
    [projectId, updateProjectInStore, showToast]
  )

  const hasAssets = assets.length > 0

  return (
    <div className={styles.app}>
      <div className={styles['app-header']}>
        <Button
          variant="icon"
          onClick={() => router.push('/')}
          aria-label="Back to projects"
        >
          &larr;
        </Button>
        <div className={styles['project-name']}>
          <span className={styles['project-label']}>Project</span>
          <EditableTitle
            value={currentProject?.name || 'Untitled project'}
            onSave={handleTitleSave}
          />
        </div>
        <span className={styles['gallery-meta']}>
          {assets.length} item{assets.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className={styles['app-main']}>
        <DropZone onFiles={uploadFiles} compact={hasAssets} />
        <Gallery
          assets={assets}
          onRemove={deleteAsset}
          onReorder={reorderAssets}
        />
      </div>
    </div>
  )
}
