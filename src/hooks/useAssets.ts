'use client'

import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useStore } from '@/store/useStore'

export function useAssets(projectId: string) {
  const assets = useStore((s) => s.assets)
  const setAssets = useStore((s) => s.setAssets)
  const addAsset = useStore((s) => s.addAsset)
  const removeAsset = useStore((s) => s.removeAsset)
  const reorderAssetsInStore = useStore((s) => s.reorderAssets)
  const setIsUploading = useStore((s) => s.setIsUploading)
  const showToast = useStore((s) => s.showToast)

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/assets`)
      if (!res.ok) throw new Error('Failed to fetch assets')
      const data = await res.json()
      setAssets(data)
    } catch {
      showToast('Failed to load assets', 'error')
    }
  }, [projectId, setAssets, showToast])

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const accepted = files.filter(
        (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
      )
      const skipped = files.length - accepted.length

      if (accepted.length === 0) {
        if (skipped > 0) {
          showToast(
            `Skipped ${skipped} unsupported file${skipped === 1 ? '' : 's'}`,
            'error'
          )
        }
        return
      }

      setIsUploading(true)
      let uploaded = 0

      for (const file of accepted) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await fetch(`/api/projects/${projectId}/assets`, {
            method: 'POST',
            body: formData,
          })
          if (!res.ok) throw new Error('Upload failed')
          const asset = await res.json()
          addAsset(asset)
          uploaded += 1
        } catch {
          showToast(`Failed to upload ${file.name}`, 'error')
        }
      }

      setIsUploading(false)

      if (uploaded > 0) {
        showToast(
          `Added ${uploaded} file${uploaded === 1 ? '' : 's'} to the collection`,
          'success'
        )
      }
      if (skipped > 0) {
        showToast(
          `Skipped ${skipped} unsupported file${skipped === 1 ? '' : 's'}`,
          'error'
        )
      }
    },
    [projectId, addAsset, setIsUploading, showToast]
  )

  const deleteAsset = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete asset')
        removeAsset(id)
        showToast('Item removed', 'success')
      } catch {
        showToast('Could not remove item', 'error')
      }
    },
    [removeAsset, showToast]
  )

  const reorderAssets = useCallback(
    async (fromIndex: number, toIndex: number) => {
      flushSync(() => {
        reorderAssetsInStore(fromIndex, toIndex)
      })

      const reordered = [...assets]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)
      const assetIds = reordered.map((a) => a.id)

      try {
        await fetch(`/api/projects/${projectId}/assets/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetIds }),
        })
      } catch {
        showToast('Failed to save new order', 'error')
      }
    },
    [projectId, assets, reorderAssetsInStore, showToast]
  )

  return {
    assets,
    fetchAssets,
    uploadFiles,
    deleteAsset,
    reorderAssets,
  }
}
