const MAX_SPEED_MULTIPLIER = 100

/**
 * `?speed=20` in the address makes the simulation run 20× faster.
 * Used by the end-to-end tests (a full program takes over a minute otherwise)
 * and handy when demoing.
 */
export function readSpeedMultiplier(search: string = window.location.search): number {
  const value = Number(new URLSearchParams(search).get('speed'))
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.min(value, MAX_SPEED_MULTIPLIER)
}
