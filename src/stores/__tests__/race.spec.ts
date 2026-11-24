import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { HORSES_PER_ROUND, RACE_ENGINE, ROUND_DISTANCES } from '@/constants/race'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'

const FRAME_MS = 16

/** Plays frames until the condition holds; fails instead of looping forever. */
function tickUntil(race: ReturnType<typeof useRaceStore>, done: () => boolean) {
  for (let frame = 0; frame < 100_000; frame++) {
    if (done()) return
    race.tick(FRAME_MS)
  }
  throw new Error('condition was never reached')
}

describe('race store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts idle, with nothing to run', () => {
    const race = useRaceStore()

    expect(race.status).toBe('idle')
    expect(race.schedule).toEqual([])
    expect(race.canStart).toBe(false)
  })

  it('cannot be started before a program exists', () => {
    const race = useRaceStore()
    race.start()

    expect(race.status).toBe('idle')
  })

  it('generates a program and lines up the first round', () => {
    const race = useRaceStore()
    race.generateSchedule()

    expect(race.status).toBe('ready')
    expect(race.schedule).toHaveLength(ROUND_DISTANCES.length)
    expect(race.currentRound?.number).toBe(1)
    expect(race.runners.map((r) => r.horseId)).toEqual(race.schedule[0]!.horseIds)
    expect(useHorsesStore().horses).toHaveLength(20)
  })

  it('does not move while it is not running', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.tick(FRAME_MS)

    expect(race.runners.every((r) => r.position === 0)).toBe(true)
  })

  it('moves the horses once started, and freezes them while paused', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.start()
    race.tick(FRAME_MS)
    expect(race.runners.every((r) => r.position > 0)).toBe(true)

    race.pause()
    const frozen = race.runners.map((r) => r.position)
    race.tick(FRAME_MS)
    expect(race.status).toBe('paused')
    expect(race.runners.map((r) => r.position)).toEqual(frozen)

    race.toggle()
    race.tick(FRAME_MS)
    expect(race.status).toBe('running')
    expect(race.runners[0]!.position).toBeGreaterThan(frozen[0]!)
  })

  it('ignores a huge frame gap instead of teleporting the horses', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.start()
    race.tick(60_000) // e.g. the tab was in the background for a minute

    const maxStep = RACE_ENGINE.baseSpeed * 2 * (RACE_ENGINE.maxFrameMs / 1000)
    expect(race.runners.every((r) => r.position < maxStep)).toBe(true)
  })

  it('publishes the result when a round ends, then moves on after a short break', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.start()
    tickUntil(race, () => race.results.length === 1)

    const [result] = race.results
    expect(result!.roundNumber).toBe(1)
    expect(result!.distance).toBe(1200)
    expect([...result!.finishOrder].sort()).toEqual([...race.schedule[0]!.horseIds].sort())
    // Still showing round 1 at the finish line during the break.
    expect(race.currentRound?.number).toBe(1)

    tickUntil(race, () => race.currentRound?.number === 2)
    expect(race.runners.every((r) => r.position === 0)).toBe(true)
    expect(race.status).toBe('running')
  })

  it('runs all six rounds one at a time and then finishes', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.start()

    const resultCounts = new Set<number>()
    tickUntil(race, () => {
      resultCounts.add(race.results.length)
      return race.status === 'finished'
    })

    expect([...resultCounts]).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(race.results.map((r) => r.distance)).toEqual([...ROUND_DISTANCES])
    expect(race.results.every((r) => r.finishOrder.length === HORSES_PER_ROUND)).toBe(true)
    expect(race.canStart).toBe(false)
  })

  it('clears the previous results when a new program is generated', () => {
    const race = useRaceStore()
    race.generateSchedule()
    race.start()
    tickUntil(race, () => race.results.length === 2)

    race.generateSchedule()

    expect(race.status).toBe('ready')
    expect(race.results).toEqual([])
    expect(race.currentRound?.number).toBe(1)
    expect(race.runners.every((r) => r.position === 0)).toBe(true)
  })
})
