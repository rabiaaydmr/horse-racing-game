import { CONDITION_MAX, RACE_ENGINE } from '@/constants/race'
import type { Runner } from '@/types/race'
import type { RandomSource } from '@/utils/random'

/**
 * The race simulation. Pure functions only: no Vue, no store, no timers.
 * The store calls these once per animation frame and keeps the returned state.
 */

/** A random value in [1 - spread, 1 + spread]. */
function vary(spread: number, random: RandomSource): number {
  return 1 + (random() * 2 - 1) * spread
}

/** Puts the horses of a round on the start line and draws their form for this round. */
export function createRunners(
  horseIds: readonly number[],
  random: RandomSource = Math.random,
): Runner[] {
  return horseIds.map((horseId) => ({
    horseId,
    position: 0,
    form: vary(RACE_ENGINE.formVariance, random),
    finishTime: null,
  }))
}

/** Current speed in metres per second: condition sets the level, form and jitter add luck. */
export function runnerSpeed(
  condition: number,
  form: number,
  random: RandomSource = Math.random,
): number {
  const { baseSpeed, minConditionFactor, paceJitter } = RACE_ENGINE
  const conditionFactor =
    minConditionFactor + (condition / CONDITION_MAX) * (1 - minConditionFactor)
  return baseSpeed * conditionFactor * form * vary(paceJitter, random)
}

export interface RaceStep {
  /** Length of the round in metres. */
  distance: number
  /** Seconds since the round started, before this step. */
  elapsed: number
  /** Length of this step in seconds. */
  dt: number
  conditionOf: (horseId: number) => number
}

/**
 * Moves every runner that is still racing forward by one time step and returns
 * the new runners (the input is not modified).
 */
export function advanceRunners(
  runners: readonly Runner[],
  step: RaceStep,
  random: RandomSource = Math.random,
): Runner[] {
  return runners.map((runner) => {
    if (runner.finishTime !== null) return runner

    const speed = runnerSpeed(step.conditionOf(runner.horseId), runner.form, random)
    const remaining = step.distance - runner.position
    const travelled = speed * step.dt

    if (travelled < remaining) {
      return { ...runner, position: runner.position + travelled }
    }

    // Crossed the line inside this step: work out the exact moment, so two horses
    // finishing within the same frame are still ranked correctly.
    const finishTime = step.elapsed + remaining / speed
    return { ...runner, position: step.distance, finishTime }
  })
}

export function isRoundComplete(runners: readonly Runner[]): boolean {
  return runners.length > 0 && runners.every((runner) => runner.finishTime !== null)
}

/** Horse ids ordered by finishing time, winner first. Unfinished runners go last, by position. */
export function rankRunners(runners: readonly Runner[]): number[] {
  return [...runners]
    .sort((a, b) => {
      if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime
      if (a.finishTime !== null) return -1
      if (b.finishTime !== null) return 1
      return b.position - a.position
    })
    .map((runner) => runner.horseId)
}
