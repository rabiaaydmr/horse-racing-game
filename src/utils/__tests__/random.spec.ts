import { describe, expect, it } from 'vitest'
import { createSeededRandom, randomInt, sample, shuffle } from '@/utils/random'

describe('randomInt', () => {
  it('includes both ends of the range', () => {
    expect(randomInt(1, 100, () => 0)).toBe(1)
    expect(randomInt(1, 100, () => 0.999999)).toBe(100)
  })
})

describe('shuffle', () => {
  it('keeps every item and leaves the input untouched', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input, createSeededRandom(1))

    expect(input).toEqual([1, 2, 3, 4, 5])
    expect([...result].sort()).toEqual(input)
  })

  it('gives the same order for the same seed', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    expect(shuffle(input, createSeededRandom(7))).toEqual(shuffle(input, createSeededRandom(7)))
  })
})

describe('sample', () => {
  it('picks the requested number of different items', () => {
    const result = sample([1, 2, 3, 4, 5, 6], 4, createSeededRandom(3))

    expect(result).toHaveLength(4)
    expect(new Set(result).size).toBe(4)
  })
})
