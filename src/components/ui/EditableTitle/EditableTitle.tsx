'use client'

import { useRef, useCallback, KeyboardEvent } from 'react'
import styles from './styles.module.scss'

interface EditableTitleProps {
  value: string
  onSave: (value: string) => void
  className?: string
}

export function EditableTitle({ value, onSave, className }: EditableTitleProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const handleBlur = useCallback(() => {
    const text = ref.current?.textContent?.trim() || ''
    onSave(text)
  }, [onSave])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        ref.current?.blur()
      }
    },
    []
  )

  const classes = [styles.title, className].filter(Boolean).join(' ')

  return (
    <span
      ref={ref}
      className={classes}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label="Edit title"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {value}
    </span>
  )
}
