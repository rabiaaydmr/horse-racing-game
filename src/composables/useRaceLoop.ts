import { onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRaceStore } from '@/stores/race'

/**
 * Connects the race store to the browser's animation frames: while the race is
 * running, `tick` is called before every repaint with the time since the last one.
 * Call once, from the component that owns the game screen.
 */
export function useRaceLoop() {
  const race = useRaceStore()
  const { isRunning } = storeToRefs(race)

  let frameId: number | null = null
  let lastTime: number | null = null

  function onFrame(time: number) {
    if (lastTime !== null) race.tick(time - lastTime)
    lastTime = time
    frameId = requestAnimationFrame(onFrame)
  }

  function startLoop() {
    if (frameId !== null) return
    lastTime = null
    frameId = requestAnimationFrame(onFrame)
  }

  function stopLoop() {
    if (frameId === null) return
    cancelAnimationFrame(frameId)
    frameId = null
  }

  watch(isRunning, (running) => (running ? startLoop() : stopLoop()), { immediate: true })
  onUnmounted(stopLoop)
}
