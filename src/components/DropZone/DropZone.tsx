'use client'

import { useRef, useCallback, useState, DragEvent } from 'react'
import styles from './styles.module.scss'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  compact?: boolean
  disabled?: boolean
}

export function DropZone({ onFiles, compact = false, disabled = false }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files
      if (fileList) onFiles(Array.from(fileList))
      if (inputRef.current) inputRef.current.value = ''
    },
    [onFiles]
  )

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (disabled) return
      const fileList = e.dataTransfer?.files
      if (fileList) onFiles(Array.from(fileList))
    },
    [onFiles, disabled]
  )

  const classes = [
    styles['drop-zone'],
    compact ? styles.compact : '',
    isDragOver ? styles['drag-over'] : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Drop files here or click to upload"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className={styles['drop-zone-inner']}>
        {!compact && (
          <p className={styles['drop-title']}>
            Drop images or videos here
          </p>
        )}
        <p className={styles['drop-subtitle']}>
          {compact ? 'Drop or click to add more files' : 'or click to browse'}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="visually-hidden"
        onChange={handleChange}
        tabIndex={-1}
      />
    </div>
  )
}
