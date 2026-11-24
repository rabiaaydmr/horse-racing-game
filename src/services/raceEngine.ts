import { CONDITION_MAX, RACE_ENGINE } from '@/constants/race'
import type { Runner } from '@/types/race'
import type { RandomSource } from '@/utils/random'

/**
 * The race simulation. Pure functions only: no Vue, no store, no timers.
 * The store calls these once per animation frame and keeps the returned state.
 *
 * A horse's speed has three parts:
 * - condition: its level, fixed for the whole game;
 * - form: how it feels this round, drawn once per round;
 * - pace: changes during the race. Every few seconds the horse picks a new target
 *   pace and drifts towards it, so it can fade, recover or come from behind.
 */

/** A random value in [1 - spread, 1 + spread]. */
function vary(spread: number, random: RandomSource): number {
  return 1 + (random() * 2 - 1) * spread
}

function randomBetween(min: number, max: number, random: RandomSource): number {
  return min + random() * (max - min)
}

/** Draws the next pace target and how long the horse keeps it. */
function nextPaceTarget(random: RandomSource): Pick<Runner, 'paceTarget' | 'paceTimeLeft'> {
  const { paceSwing, paceHoldSeconds } = RACE_ENGINE
  return {
    paceTarget: vary(paceSwing, random),
    paceTimeLeft: randomBetween(paceHoldSeconds.min, paceHoldSeconds.max, random),
  }
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
    pace: 1,
    ...nextPaceTarget(random),
    finishTime: null,
  }))
}

/** Speed in metres per second: condition sets the level, form and pace add luck. */
export function runnerSpeed(condition: number, form: number, pace: number): number {
  const { baseSpeed, minConditionFactor } = RACE_ENGINE
  const conditionFactor =
    minConditionFactor + (condition / CONDITION_MAX) * (1 - minConditionFactor)
  return baseSpeed * conditionFactor * form * pace
}

/**
 * Moves the pace one step towards its target, and picks a new target when the
 * current one has been kept long enough.
 */
export function updatePace(
  runner: Runner,
  dt: number,
  random: RandomSource = Math.random,
): Pick<Runner, 'pace' | 'paceTarget' | 'paceTimeLeft'> {
  const target =
    runner.paceTimeLeft - dt > 0
      ? { paceTarget: runner.paceTarget, paceTimeLeft: runner.paceTimeLeft - dt }
      : nextPaceTarget(random)

  const share = Math.min(1, dt * RACE_ENGINE.paceResponse)
  const pace = runner.pace + (target.paceTarget - runner.pace) * share

  return { pace, ...target }
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

    const paceState = updatePace(runner, step.dt, random)
    const speed = runnerSpeed(step.conditionOf(runner.horseId), runner.form, paceState.pace)
    const remaining = step.distance - runner.position
    const travelled = speed * step.dt

    if (travelled < remaining) {
      return { ...runner, ...paceState, position: runner.position + travelled }
    }

    // Crossed the line inside this step: work out the exact moment, so two horses
    // finishing within the same frame are still ranked correctly.
    const finishTime = step.elapsed + remaining / speed
    return { ...runner, ...paceState, position: step.distance, finishTime }
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
