'use client'

import { useCallback, useRef } from 'react'

interface UseDragAndDropOptions {
  onReorder: (fromIndex: number, toIndex: number) => void
}

interface RectMap {
  [key: string]: DOMRect
}

export function useDragAndDrop({ onReorder }: UseDragAndDropOptions) {
  const dragIndexRef = useRef<number | null>(null)
  const rectsRef = useRef<RectMap>({})

  const captureRects = useCallback((container: HTMLElement) => {
    const rects: RectMap = {}
    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, i) => {
      rects[i.toString()] = child.getBoundingClientRect()
    })
    rectsRef.current = rects
  }, [])

  const animateFlip = useCallback((container: HTMLElement, excludeIndex: number) => {
    const oldRects = rectsRef.current
    const children = Array.from(container.children) as HTMLElement[]

    children.forEach((child, i) => {
      if (i === excludeIndex) return
      const oldRect = oldRects[i.toString()]
      if (!oldRect) return

      const newRect = child.getBoundingClientRect()
      const dx = oldRect.left - newRect.left
      const dy = oldRect.top - newRect.top
      if (dx === 0 && dy === 0) return

      child.style.transform = `translate(${dx}px, ${dy}px)`
      child.style.opacity = '0.7'
    })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        children.forEach((child, i) => {
          if (i === excludeIndex) return
          child.style.transform = ''
          child.style.opacity = ''
        })
      })
    })
  }, [])

  const handleDragStart = useCallback(
    (index: number) => {
      dragIndexRef.current = index
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetIndex: number, container: HTMLElement) => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'

      const fromIndex = dragIndexRef.current
      if (fromIndex === null || fromIndex === targetIndex) return

      captureRects(container)
      onReorder(fromIndex, targetIndex)
      dragIndexRef.current = targetIndex

      requestAnimationFrame(() => {
        animateFlip(container, targetIndex)
      })
    },
    [onReorder, captureRects, animateFlip]
  )

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null
    rectsRef.current = {}
  }, [])

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    isDragging: (index: number) => dragIndexRef.current === index,
  }
}
