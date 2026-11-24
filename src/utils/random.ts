/**
 * A function returning a number in [0, 1), like Math.random.
 * Everything random in the game takes one as a parameter, so tests can pass a
 * predictable source instead of mocking globals.
 */
export type RandomSource = () => number

/** Random integer between min and max, both included. */
export function randomInt(min: number, max: number, random: RandomSource = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min
}

/** Returns a shuffled copy (Fisher–Yates); the input is left untouched. */
export function shuffle<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j] as T, result[i] as T]
  }
  return result
}

/** Picks `count` different items in random order. */
export function sample<T>(
  items: readonly T[],
  count: number,
  random: RandomSource = Math.random,
): T[] {
  return shuffle(items, random).slice(0, count)
}

/**
 * A repeatable random source (mulberry32): the same seed always gives the same
 * sequence. Used wherever a run must be reproducible, e.g. in tests.
 */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
