import {
  CONDITION_MAX,
  CONDITION_MIN,
  HORSE_COLORS,
  HORSE_NAMES,
  TOTAL_HORSES,
} from '@/constants/race'
import type { Horse } from '@/types/race'
import { randomInt, shuffle, type RandomSource } from '@/utils/random'

/**
 * Creates the stable of horses. Names and colours are dealt from shuffled lists,
 * which guarantees every horse a unique colour; condition is random per horse.
 */
export function createHorses(random: RandomSource = Math.random): Horse[] {
  const names = shuffle(HORSE_NAMES, random)
  const colors = shuffle(HORSE_COLORS, random)

  return Array.from({ length: TOTAL_HORSES }, (_, index) => ({
    id: index + 1,
    name: names[index]!,
    color: colors[index]!,
    condition: randomInt(CONDITION_MIN, CONDITION_MAX, random),
  }))
}
