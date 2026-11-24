import type { HorseColor } from '@/types/race'

export const TOTAL_HORSES = 20
export const HORSES_PER_ROUND = 10
export const CONDITION_MIN = 1
export const CONDITION_MAX = 100

/** Length of each round in metres. The number of rounds follows from this list. */
export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const

/** Tuning of the race simulation. Changing these never requires touching the engine. */
export const RACE_ENGINE = {
  /** Speed of a horse in perfect condition, in (simulated) metres per second. */
  baseSpeed: 170,
  /** A horse with the worst condition still runs at this share of the base speed. */
  minConditionFactor: 0.75,
  /** Per-round luck: form is picked once per round within ±this share. */
  formVariance: 0.08,
  /**
   * Pace changes during the race, so a horse can fade or come from behind.
   * Every few seconds each horse picks a new target pace within ±this share…
   */
  paceSwing: 0.15,
  /** …keeps it for this many seconds (picked at random in between)… */
  paceHoldSeconds: { min: 1, max: 3 },
  /** …and closes this share of the gap to the target per second (smooth, not instant). */
  paceResponse: 1.5,
  /** Pause between two rounds so the result can be read. */
  roundBreakSeconds: 1.5,
  /** Longest time step accepted from one frame (e.g. after the tab was in the background). */
  maxFrameMs: 100,
} as const

export const HORSE_NAMES: readonly string[] = [
  'Midnight Comet',
  'Silver Ember',
  'Copper Gale',
  'Velvet Thunder',
  'Northern Echo',
  'Crimson Tide',
  'Golden Harbor',
  'Shadow Dancer',
  'Wild Meridian',
  'Lucky Lantern',
  'Storm Chaser',
  'Amber Whisper',
  'Iron Willow',
  'Blue Horizon',
  'Dusty Crown',
  'Quiet Riot',
  'Maple Arrow',
  'Frosty Morning',
  'Desert Rose',
  'Royal Pepper',
]

export const HORSE_COLORS: readonly HorseColor[] = [
  { name: 'Red', hex: '#e6194b' },
  { name: 'Green', hex: '#3cb44b' },
  { name: 'Yellow', hex: '#ffe119' },
  { name: 'Blue', hex: '#4363d8' },
  { name: 'Orange', hex: '#f58231' },
  { name: 'Purple', hex: '#911eb4' },
  { name: 'Cyan', hex: '#42d4f4' },
  { name: 'Magenta', hex: '#f032e6' },
  { name: 'Lime', hex: '#bfef45' },
  { name: 'Pink', hex: '#fabed4' },
  { name: 'Teal', hex: '#469990' },
  { name: 'Lavender', hex: '#dcbeff' },
  { name: 'Brown', hex: '#9a6324' },
  { name: 'Gold', hex: '#c9a227' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Mint', hex: '#aaffc3' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Coral', hex: '#ff7f6e' },
  { name: 'Navy', hex: '#000075' },
  { name: 'Grey', hex: '#8a8a8a' },
]
