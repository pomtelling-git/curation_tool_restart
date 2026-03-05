'use client'

import { useState } from 'react'
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
  columnCount?: number
}

export function Gallery({
  assets,
  onRemove,
  onReorder,
  columnCount = 3,
}: GalleryProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  if (assets.length === 0) return null

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === targetIndex) return
    onReorder(dragIndex, targetIndex)
    setDragIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
  }

  return (
    <div
      className={styles.gallery}
      role="list"
      style={{ columnCount }}
    >
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
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          isDragging={dragIndex === index}
        />
      ))}
    </div>
  )
}
