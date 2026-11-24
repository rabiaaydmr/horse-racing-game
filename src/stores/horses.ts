import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { createHorses } from '@/services/horseFactory'
import type { Horse } from '@/types/race'

/** The stable: which horses exist. Knows nothing about races. */
export const useHorsesStore = defineStore('horses', () => {
  const horses = ref<Horse[]>([])

  const horseById = computed(() => new Map(horses.value.map((horse) => [horse.id, horse])))

  function generateHorses() {
    horses.value = createHorses()
  }

  function getHorse(id: number): Horse {
    const horse = horseById.value.get(id)
    if (!horse) throw new Error(`Unknown horse id: ${id}`)
    return horse
  }

  return { horses, horseById, generateHorses, getHorse }
})
