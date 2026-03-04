import { describe, it, expect } from 'vitest'
import { formatBytes, formatDuration } from './format'

describe('formatBytes', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('returns "0 B" for negative values', () => {
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('returns "0 B" for NaN', () => {
    expect(formatBytes(NaN)).toBe('0 B')
  })

  it('formats bytes correctly', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats megabytes correctly', () => {
    expect(formatBytes(1.2 * 1024 * 1024)).toBe('1.2 MB')
  })

  it('formats large megabytes without decimal', () => {
    expect(formatBytes(50 * 1024 * 1024)).toBe('50 MB')
  })

  it('formats gigabytes correctly', () => {
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
  })
})

describe('formatDuration', () => {
  it('returns empty string for zero', () => {
    expect(formatDuration(0)).toBe('')
  })

  it('returns empty string for negative', () => {
    expect(formatDuration(-5)).toBe('')
  })

  it('returns empty string for NaN', () => {
    expect(formatDuration(NaN)).toBe('')
  })

  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(135)).toBe('2m 15s')
  })

  it('pads seconds with zero', () => {
    expect(formatDuration(65)).toBe('1m 05s')
  })
})
