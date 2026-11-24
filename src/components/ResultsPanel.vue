<script setup lang="ts">
import { computed, ref } from 'vue'
import BasePanel from '@/components/BasePanel.vue'
import RoundTable from '@/components/RoundTable.vue'
import { useScrollToChild } from '@/composables/useScrollToChild'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { roundLabel } from '@/utils/format'

const horsesStore = useHorsesStore()
const race = useRaceStore()

const rounds = computed(() =>
  race.results.map((result) => ({
    number: result.roundNumber,
    title: roundLabel(result.roundNumber, result.distance),
    horses: result.finishOrder.map(horsesStore.getHorse),
  })),
)

// Bring the newest result into view as soon as it is added.
const list = ref<HTMLElement | null>(null)
useScrollToChild(
  list,
  computed(() => rounds.value.length - 1),
)
</script>

<template>
  <BasePanel title="Results" tone="green" data-testid="results-panel">
    <div ref="list">
      <RoundTable
        v-for="round in rounds"
        :key="round.number"
        :title="round.title"
        :horses="round.horses"
      />
    </div>
  </BasePanel>
</template>
