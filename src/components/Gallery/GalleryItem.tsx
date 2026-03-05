'use client'

import { memo, useRef, useCallback, useState, DragEvent } from 'react'
import Image from 'next/image'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import styles from './styles.module.scss'

interface GalleryItemProps {
  id: string
  fileName: string
  url: string
  mimeType: string
  size: number
  index: number
  onRemove: (id: string) => void
  onDragStart: (index: number) => void
  onDragOver: (e: DragEvent, index: number, container: HTMLElement) => void
  onDragEnd: () => void
  onDrop: (e: DragEvent) => void
  isDragging: boolean
}

function GalleryItemComponent({
  id,
  fileName,
  url,
  mimeType,
  size,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
}: GalleryItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoMeta, setVideoMeta] = useState('')
  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')
  const typeLabel = isImage ? (mimeType.split('/')[1] || 'image') : 'video'

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const info: string[] = []
    if (video.videoWidth && video.videoHeight) {
      info.push(`${video.videoWidth}\u00d7${video.videoHeight}`)
    }
    if (video.duration && Number.isFinite(video.duration)) {
      const dur = formatDuration(video.duration)
      if (dur) info.push(dur)
    }
    if (info.length) setVideoMeta(info.join(' \u2022 '))
  }, [])

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', index.toString())
      }
      onDragStart(index)
    },
    [onDragStart, index]
  )

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      const container = (e.currentTarget as HTMLElement).parentElement
      if (container) onDragOver(e, index, container)
    },
    [onDragOver, index]
  )

  const classes = [
    styles['gallery-item'],
    isDragging ? styles.dragging : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={classes}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className={styles['media-wrapper']}>
        <span className={styles['media-badge']}>
          {isImage ? 'Image' : 'Video'}
        </span>

        <button
          className={styles['remove-button']}
          type="button"
          aria-label={`Remove ${fileName} from gallery`}
          onClick={() => onRemove(id)}
        >
          &times;
        </button>

        <a
          className={styles['download-button']}
          href={url}
          download={fileName}
          aria-label={`Download ${fileName}`}
          onClick={(e) => e.stopPropagation()}
        >
          &darr;
        </a>

        {isImage && (
          <Image
            src={url}
            alt={fileName}
            width={400}
            height={300}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            loading="lazy"
            className={styles['gallery-image']}
            draggable={false}
          />
        )}
        {isVideo && (
          <video
            ref={videoRef}
            src={url}
            muted
            loop
            autoPlay
            playsInline
            draggable={false}
            onClick={handleVideoClick}
            onLoadedMetadata={handleLoadedMetadata}
          />
        )}
      </div>

      <div className={styles['item-meta']}>
        <p className={styles['item-name']}>{fileName}</p>
        <p className={styles['item-details']}>
          <span>{formatBytes(size)}</span>
          <span>{videoMeta || typeLabel}</span>
        </p>
      </div>
    </article>
  )
}

export const GalleryItem = memo(GalleryItemComponent)
