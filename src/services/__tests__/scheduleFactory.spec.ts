import { describe, expect, it } from 'vitest'
import { HORSES_PER_ROUND } from '@/constants/race'
import { createHorses } from '@/services/horseFactory'
import { createSchedule } from '@/services/scheduleFactory'
import { createSeededRandom } from '@/utils/random'

describe('createSchedule', () => {
  const random = createSeededRandom(42)
  const horses = createHorses(random)
  const schedule = createSchedule(horses, random)

  it('creates six rounds with the required distances, in order', () => {
    expect(schedule.map((round) => round.number)).toEqual([1, 2, 3, 4, 5, 6])
    expect(schedule.map((round) => round.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
  })

  it('puts 10 different, existing horses in every round', () => {
    const knownIds = new Set(horses.map((horse) => horse.id))

    for (const round of schedule) {
      expect(round.horseIds).toHaveLength(HORSES_PER_ROUND)
      expect(new Set(round.horseIds).size).toBe(HORSES_PER_ROUND)
      expect(round.horseIds.every((id) => knownIds.has(id))).toBe(true)
    }
  })

  it('draws the horses separately for each round', () => {
    const lineups = new Set(schedule.map((round) => round.horseIds.join(',')))
    expect(lineups.size).toBeGreaterThan(1)
  })
})
