import { describe, expect, it } from 'vitest'
import { RACE_ENGINE } from '@/constants/race'
import {
  advanceRunners,
  createRunners,
  isRoundComplete,
  rankRunners,
  runnerSpeed,
  type RaceStep,
} from '@/services/raceEngine'
import type { Runner } from '@/types/race'
import { createSeededRandom } from '@/utils/random'

/** A random source that always returns the middle value: no luck, no jitter. */
const noLuck = () => 0.5

function runner(overrides: Partial<Runner> = {}): Runner {
  return { horseId: 1, position: 0, form: 1, finishTime: null, ...overrides }
}

function step(overrides: Partial<RaceStep> = {}): RaceStep {
  return { distance: 1200, elapsed: 0, dt: 0.1, conditionOf: () => 100, ...overrides }
}

describe('createRunners', () => {
  it('puts every horse on the start line, in lane order', () => {
    const runners = createRunners([7, 3, 9], createSeededRandom(1))

    expect(runners.map((r) => r.horseId)).toEqual([7, 3, 9])
    expect(runners.every((r) => r.position === 0 && r.finishTime === null)).toBe(true)
  })

  it('keeps form within the configured variance', () => {
    const runners = createRunners(
      Array.from({ length: 200 }, (_, i) => i),
      createSeededRandom(2),
    )

    for (const { form } of runners) {
      expect(form).toBeGreaterThanOrEqual(1 - RACE_ENGINE.formVariance)
      expect(form).toBeLessThanOrEqual(1 + RACE_ENGINE.formVariance)
    }
  })
})

describe('runnerSpeed', () => {
  it('runs at base speed in perfect condition with no luck', () => {
    expect(runnerSpeed(100, 1, noLuck)).toBeCloseTo(RACE_ENGINE.baseSpeed)
  })

  it('is faster for a horse in better condition', () => {
    expect(runnerSpeed(90, 1, noLuck)).toBeGreaterThan(runnerSpeed(40, 1, noLuck))
  })

  it('never stops, even in the worst condition', () => {
    expect(runnerSpeed(1, 1, () => 0)).toBeGreaterThan(0)
  })
})

describe('advanceRunners', () => {
  it('moves a runner by speed × time', () => {
    const [moved] = advanceRunners([runner()], step({ dt: 0.5 }), noLuck)

    expect(moved!.position).toBeCloseTo(RACE_ENGINE.baseSpeed * 0.5)
    expect(moved!.finishTime).toBeNull()
  })

  it('does not modify its input', () => {
    const before = runner()
    advanceRunners([before], step(), noLuck)

    expect(before.position).toBe(0)
  })

  it('stops at the finish line and records the exact finishing time', () => {
    // 85 m to go at 170 m/s → crosses the line 0.5 s into a 1 s step.
    const almostThere = runner({ position: 1200 - RACE_ENGINE.baseSpeed / 2 })
    const [finished] = advanceRunners([almostThere], step({ elapsed: 10, dt: 1 }), noLuck)

    expect(finished!.position).toBe(1200)
    expect(finished!.finishTime).toBeCloseTo(10.5)
  })

  it('leaves a finished runner alone', () => {
    const finished = runner({ position: 1200, finishTime: 8 })
    const [after] = advanceRunners([finished], step({ elapsed: 20 }), noLuck)

    expect(after).toBe(finished)
  })
})

describe('isRoundComplete', () => {
  it('is true only when every runner has finished', () => {
    expect(isRoundComplete([runner({ finishTime: 8 }), runner()])).toBe(false)
    expect(isRoundComplete([runner({ finishTime: 8 }), runner({ finishTime: 9 })])).toBe(true)
  })

  it('is false for an empty track', () => {
    expect(isRoundComplete([])).toBe(false)
  })
})

describe('rankRunners', () => {
  it('orders by finishing time, winner first', () => {
    const order = rankRunners([
      runner({ horseId: 1, finishTime: 9.2 }),
      runner({ horseId: 2, finishTime: 8.1 }),
      runner({ horseId: 3, finishTime: 8.7 }),
    ])

    expect(order).toEqual([2, 3, 1])
  })

  it('puts runners still on the track after the finishers, by position', () => {
    const order = rankRunners([
      runner({ horseId: 1, position: 300 }),
      runner({ horseId: 2, position: 900 }),
      runner({ horseId: 3, position: 1200, finishTime: 8 }),
    ])

    expect(order).toEqual([3, 2, 1])
  })
})

describe('a whole round', () => {
  it('lets fitter horses win more often, but not always', () => {
    const random = createSeededRandom(2026)
    const condition: Record<number, number> = { 1: 95, 2: 55 }
    let fitWins = 0
    const races = 300

    for (let race = 0; race < races; race++) {
      let runners = createRunners([1, 2], random)
      let elapsed = 0
      while (!isRoundComplete(runners)) {
        runners = advanceRunners(
          runners,
          { distance: 1200, elapsed, dt: 1 / 60, conditionOf: (id) => condition[id]! },
          random,
        )
        elapsed += 1 / 60
      }
      if (rankRunners(runners)[0] === 1) fitWins++
    }

    expect(fitWins).toBeGreaterThan(races * 0.6)
    expect(fitWins).toBeLessThan(races)
  })
})
