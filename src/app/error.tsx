'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, marginBottom: 8 }}>Something went wrong.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
