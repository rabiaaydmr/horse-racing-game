export interface HorseColor {
  name: string
  hex: string
}

export interface Horse {
  id: number
  name: string
  color: HorseColor
  /** Fitness of the horse, 1 (worst) to 100 (best). Fitter horses run faster on average. */
  condition: number
}

/** One race of the program. `horseIds` is in lane order: index 0 runs in lane 1. */
export interface Round {
  number: number
  distance: number
  horseIds: number[]
}

/** Outcome of a finished round. `finishOrder` holds horse ids, winner first. */
export interface RoundResult {
  roundNumber: number
  distance: number
  finishOrder: number[]
}

/** Live state of one horse while a round is being run. */
export interface Runner {
  horseId: number
  /** Metres covered so far. */
  position: number
  /** How the horse feels in this particular round (multiplier around 1). */
  form: number
  /** Seconds from the start of the round to crossing the line; null while still running. */
  finishTime: number | null
}

/**
 * idle     → no program yet
 * ready    → program generated, waiting for Start
 * running  → a round (or the short break between two rounds) is in progress
 * paused   → stopped by the user, can be resumed
 * finished → all rounds are done
 */
export type RaceStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished'
