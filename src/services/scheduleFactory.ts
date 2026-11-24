import { HORSES_PER_ROUND, ROUND_DISTANCES } from '@/constants/race'
import type { Horse, Round } from '@/types/race'
import { sample, type RandomSource } from '@/utils/random'

/** Builds the race program: one round per distance, each with its own random draw of horses. */
export function createSchedule(
  horses: readonly Horse[],
  random: RandomSource = Math.random,
): Round[] {
  const horseIds = horses.map((horse) => horse.id)

  return ROUND_DISTANCES.map((distance, index) => ({
    number: index + 1,
    distance,
    horseIds: sample(horseIds, HORSES_PER_ROUND, random),
  }))
}
