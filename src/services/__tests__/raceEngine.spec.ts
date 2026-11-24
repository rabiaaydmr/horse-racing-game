import { describe, expect, it } from 'vitest'
import { RACE_ENGINE } from '@/constants/race'
import {
  advanceRunners,
  createRunners,
  isRoundComplete,
  rankRunners,
  runnerSpeed,
  updatePace,
  type RaceStep,
} from '@/services/raceEngine'
import type { Runner } from '@/types/race'
import { createSeededRandom, type RandomSource } from '@/utils/random'

/** A random source that always returns the middle value: no luck, steady pace. */
const noLuck = () => 0.5

/** A horse in a steady pace that will not change for a long time. */
function runner(overrides: Partial<Runner> = {}): Runner {
  return {
    horseId: 1,
    position: 0,
    form: 1,
    pace: 1,
    paceTarget: 1,
    paceTimeLeft: 100,
    finishTime: null,
    ...overrides,
  }
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
    expect(runnerSpeed(100, 1, 1)).toBeCloseTo(RACE_ENGINE.baseSpeed)
  })

  it('is faster for a horse in better condition', () => {
    expect(runnerSpeed(90, 1, 1)).toBeGreaterThan(runnerSpeed(40, 1, 1))
  })

  it('never stops, even in the worst condition, form and pace', () => {
    const worstForm = 1 - RACE_ENGINE.formVariance
    const worstPace = 1 - RACE_ENGINE.paceSwing
    expect(runnerSpeed(1, worstForm, worstPace)).toBeGreaterThan(0)
  })
})

describe('updatePace', () => {
  it('moves towards the target gradually, not in one frame', () => {
    const start = runner({ pace: 1, paceTarget: 1.15 })
    const afterOneFrame = updatePace(start, 1 / 60, noLuck)

    expect(afterOneFrame.pace).toBeGreaterThan(1)
    expect(afterOneFrame.pace).toBeLessThan(1.05)
  })

  it('gets close to the target within a few seconds', () => {
    let state = runner({ pace: 1, paceTarget: 1.15 })
    for (let frame = 0; frame < 3 * 60; frame++) state = { ...state, ...updatePace(state, 1 / 60) }

    expect(state.pace).toBeCloseTo(1.15, 1)
  })

  it('keeps its target until the hold time is over, then picks a new one', () => {
    const always =
      (value: number): RandomSource =>
      () =>
        value
    const holding = runner({ paceTarget: 1.1, paceTimeLeft: 0.5 })

    expect(updatePace(holding, 0.1, always(0)).paceTarget).toBe(1.1)

    const renewed = updatePace(holding, 0.6, always(0))
    expect(renewed.paceTarget).toBeCloseTo(1 - RACE_ENGINE.paceSwing)
    expect(renewed.paceTimeLeft).toBeCloseTo(RACE_ENGINE.paceHoldSeconds.min)
  })

  it('keeps new targets within the configured swing', () => {
    const random = createSeededRandom(5)
    for (let i = 0; i < 200; i++) {
      const { paceTarget } = updatePace(runner({ paceTimeLeft: 0 }), 1 / 60, random)
      expect(paceTarget).toBeGreaterThanOrEqual(1 - RACE_ENGINE.paceSwing)
      expect(paceTarget).toBeLessThanOrEqual(1 + RACE_ENGINE.paceSwing)
    }
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
  /** Runs one round frame by frame; also returns the order when the leader was a quarter in. */
  function runRound(conditions: number[], random: RandomSource) {
    const distance = 1200
    let runners = createRunners(
      conditions.map((_, id) => id),
      random,
    )
    let elapsed = 0
    let orderAtQuarter: number[] | null = null

    while (!isRoundComplete(runners)) {
      runners = advanceRunners(
        runners,
        { distance, elapsed, dt: 1 / 60, conditionOf: (id) => conditions[id]! },
        random,
      )
      elapsed += 1 / 60
      const leaderPosition = Math.max(...runners.map((r) => r.position))
      if (!orderAtQuarter && leaderPosition >= distance / 4) orderAtQuarter = rankRunners(runners)
    }

    return { orderAtQuarter: orderAtQuarter!, finishOrder: rankRunners(runners) }
  }

  it('lets fitter horses win more often, but not always', () => {
    const random = createSeededRandom(2026)
    const races = 300
    let fitWins = 0

    for (let race = 0; race < races; race++) {
      if (runRound([95, 55], random).finishOrder[0] === 0) fitWins++
    }

    expect(fitWins).toBeGreaterThan(races * 0.6)
    expect(fitWins).toBeLessThan(races)
  })

  it('lets a horse come from behind: the early leader does not always win', () => {
    // With the old per-frame jitter, the leader at a quarter of the race won ~85% of
    // the time and the winner was almost never outside the top three at that point.
    const random = createSeededRandom(7)
    const races = 400
    let earlyLeaderWins = 0
    let winsFromOutsideTopThree = 0

    for (let race = 0; race < races; race++) {
      const conditions = Array.from({ length: 10 }, () => 1 + Math.floor(random() * 100))
      const { orderAtQuarter, finishOrder } = runRound(conditions, random)
      const winner = finishOrder[0]!
      if (orderAtQuarter[0] === winner) earlyLeaderWins++
      if (orderAtQuarter.indexOf(winner) > 2) winsFromOutsideTopThree++
    }

    expect(earlyLeaderWins).toBeLessThan(races * 0.75)
    expect(winsFromOutsideTopThree).toBeGreaterThan(races * 0.02)
  })
})
