'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import styles from './styles.module.scss'

const TOAST_DURATION_MS = 2200

export function Toast() {
  const toast = useStore((s) => s.toast)
  const hideToast = useStore((s) => s.hideToast)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!toast) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(hideToast, TOAST_DURATION_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast, hideToast])

  if (!toast) return null

  const classes = [
    styles.toast,
    styles.visible,
    toast.variant === 'error' ? styles.error : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="status" aria-live="polite">
      {toast.message}
    </div>
  )
}
