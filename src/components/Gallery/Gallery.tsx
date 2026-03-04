'use client'

import { useRef } from 'react'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import { GalleryItem } from './GalleryItem'
import styles from './styles.module.scss'

interface AssetWithUrl {
  id: string
  fileName: string
  url: string
  mimeType: string
  size: number
}

interface GalleryProps {
  assets: AssetWithUrl[]
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function Gallery({ assets, onRemove, onReorder }: GalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop({
    onReorder,
  })

  if (assets.length === 0) return null

  return (
    <div ref={containerRef} className={styles.gallery} role="list">
      {assets.map((asset, index) => (
        <GalleryItem
          key={asset.id}
          id={asset.id}
          fileName={asset.fileName}
          url={asset.url}
          mimeType={asset.mimeType}
          size={asset.size}
          index={index}
          onRemove={onRemove}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          isDragging={false}
        />
      ))}
    </div>
  )
}
