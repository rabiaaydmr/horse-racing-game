import { describe, expect, it } from 'vitest'
import { readSpeedMultiplier } from '@/utils/runtimeConfig'

describe('readSpeedMultiplier', () => {
  it('defaults to normal speed', () => {
    expect(readSpeedMultiplier('')).toBe(1)
  })

  it('reads the speed parameter', () => {
    expect(readSpeedMultiplier('?speed=20')).toBe(20)
  })

  it('ignores values that make no sense', () => {
    expect(readSpeedMultiplier('?speed=abc')).toBe(1)
    expect(readSpeedMultiplier('?speed=-5')).toBe(1)
    expect(readSpeedMultiplier('?speed=0')).toBe(1)
  })

  it('caps very large values', () => {
    expect(readSpeedMultiplier('?speed=100000')).toBe(100)
  })
})
