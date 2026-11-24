import { describe, expect, it } from 'vitest'
import { CONDITION_MAX, CONDITION_MIN, TOTAL_HORSES } from '@/constants/race'
import { createHorses } from '@/services/horseFactory'
import { createSeededRandom } from '@/utils/random'

describe('createHorses', () => {
  // Many seeds instead of one, so a rule that only holds "by luck" is caught.
  const stables = Array.from({ length: 50 }, (_, seed) => createHorses(createSeededRandom(seed)))

  it('creates 20 horses', () => {
    for (const horses of stables) expect(horses).toHaveLength(TOTAL_HORSES)
  })

  it('gives every horse a unique id, name and colour', () => {
    for (const horses of stables) {
      expect(new Set(horses.map((h) => h.id)).size).toBe(TOTAL_HORSES)
      expect(new Set(horses.map((h) => h.name)).size).toBe(TOTAL_HORSES)
      expect(new Set(horses.map((h) => h.color.hex)).size).toBe(TOTAL_HORSES)
    }
  })

  it('keeps condition between 1 and 100', () => {
    for (const horse of stables.flat()) {
      expect(Number.isInteger(horse.condition)).toBe(true)
      expect(horse.condition).toBeGreaterThanOrEqual(CONDITION_MIN)
      expect(horse.condition).toBeLessThanOrEqual(CONDITION_MAX)
    }
  })
})
