import { describe, expect, it } from 'vitest'
import { ordinal, roundLabel } from '@/utils/format'

describe('ordinal', () => {
  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
  ])('%i → %s', (value, expected) => {
    expect(ordinal(value)).toBe(expected)
  })
})

describe('roundLabel', () => {
  it('combines the round number and the distance', () => {
    expect(roundLabel(1, 1200)).toBe('1st Lap - 1200m')
  })
})
