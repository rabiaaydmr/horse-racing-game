import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { RACE_ENGINE } from '@/constants/race'
import { advanceRunners, createRunners, isRoundComplete, rankRunners } from '@/services/raceEngine'
import { createSchedule } from '@/services/scheduleFactory'
import { useHorsesStore } from '@/stores/horses'
import type { RaceStatus, Round, RoundResult, Runner } from '@/types/race'
import { readSpeedMultiplier } from '@/utils/runtimeConfig'

/**
 * The race: program, live positions, results and the state machine around them.
 *
 * The store has no timer of its own. Time only moves when someone calls `tick`
 * (the `useRaceLoop` composable does, once per animation frame). That keeps
 * pause/resume trivial and lets tests play a whole program without waiting.
 */
export const useRaceStore = defineStore('race', () => {
  const horsesStore = useHorsesStore()

  // --- state ---
  const status = ref<RaceStatus>('idle')
  const schedule = ref<Round[]>([])
  const results = ref<RoundResult[]>([])
  const currentRoundIndex = ref(0)
  const runners = ref<Runner[]>([])
  /** Simulated seconds since the current round started. */
  const elapsed = ref(0)
  /** Simulated seconds left of the break after a round; 0 while a round is being run. */
  const breakRemaining = ref(0)
  const speedMultiplier = ref(readSpeedMultiplier())

  // --- derived state ---
  const currentRound = computed<Round | null>(() => schedule.value[currentRoundIndex.value] ?? null)
  const isRunning = computed(() => status.value === 'running')
  const canStart = computed(() => ['ready', 'running', 'paused'].includes(status.value))

  // --- actions ---

  /** Creates a new program and resets everything from a previous one. */
  function generateSchedule() {
    if (horsesStore.horses.length === 0) horsesStore.generateHorses()

    schedule.value = createSchedule(horsesStore.horses)
    results.value = []
    status.value = 'ready'
    enterRound(0)
  }

  function start() {
    if (status.value === 'ready' || status.value === 'paused') status.value = 'running'
  }

  function pause() {
    if (status.value === 'running') status.value = 'paused'
  }

  function toggle() {
    if (status.value === 'running') pause()
    else start()
  }

  /** Advances the race by `frameMs` milliseconds of real time. No-op unless running. */
  function tick(frameMs: number) {
    const round = currentRound.value
    if (status.value !== 'running' || !round) return

    const dt = (Math.min(frameMs, RACE_ENGINE.maxFrameMs) / 1000) * speedMultiplier.value

    if (breakRemaining.value > 0) {
      breakRemaining.value -= dt
      if (breakRemaining.value <= 0) enterRound(currentRoundIndex.value + 1)
      return
    }

    runners.value = advanceRunners(runners.value, {
      distance: round.distance,
      elapsed: elapsed.value,
      dt,
      conditionOf: (horseId) => horsesStore.getHorse(horseId).condition,
    })
    elapsed.value += dt

    if (isRoundComplete(runners.value)) completeRound(round)
  }

  // --- internals (not returned, so components cannot call them) ---

  function enterRound(index: number) {
    const round = schedule.value[index]
    currentRoundIndex.value = index
    runners.value = round ? createRunners(round.horseIds) : []
    elapsed.value = 0
    breakRemaining.value = 0
  }

  function completeRound(round: Round) {
    results.value.push({
      roundNumber: round.number,
      distance: round.distance,
      finishOrder: rankRunners(runners.value),
    })

    const isLastRound = currentRoundIndex.value === schedule.value.length - 1
    if (isLastRound) status.value = 'finished'
    else breakRemaining.value = RACE_ENGINE.roundBreakSeconds
  }

  return {
    status,
    schedule,
    results,
    currentRoundIndex,
    currentRound,
    runners,
    speedMultiplier,
    isRunning,
    canStart,
    generateSchedule,
    start,
    pause,
    toggle,
    tick,
  }
})
