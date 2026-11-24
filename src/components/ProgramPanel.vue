<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BasePanel from '@/components/BasePanel.vue'
import RoundTable from '@/components/RoundTable.vue'
import { useScrollToChild } from '@/composables/useScrollToChild'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { roundLabel } from '@/utils/format'

const horsesStore = useHorsesStore()
const race = useRaceStore()
const { currentRoundIndex } = storeToRefs(race)

const rounds = computed(() =>
  race.schedule.map((round, index) => ({
    number: round.number,
    title: roundLabel(round.number, round.distance),
    horses: round.horseIds.map(horsesStore.getHorse),
    isCurrent: index === race.currentRoundIndex && race.status !== 'finished',
  })),
)

// Follow the race: keep the round that is being run in view.
const list = ref<HTMLElement | null>(null)
useScrollToChild(list, currentRoundIndex)
</script>

<template>
  <BasePanel title="Program" tone="blue" data-testid="program-panel">
    <div ref="list">
      <RoundTable
        v-for="round in rounds"
        :key="round.number"
        :title="round.title"
        :horses="round.horses"
        :highlighted="round.isCurrent"
      />
    </div>
  </BasePanel>
</template>
