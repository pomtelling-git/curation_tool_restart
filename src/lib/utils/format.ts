const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1
  )
  const value = bytes / 1024 ** exponent
  const decimals = value < 10 && exponent > 0 ? 1 : 0
  return `${value.toFixed(decimals)} ${SIZE_UNITS[exponent]}`
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.round(seconds % 60)
  if (minutes === 0) return `${remaining}s`
  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`
}
