<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import BasePanel from '@/components/BasePanel.vue'
import HorseList from '@/components/HorseList.vue'
import ProgramPanel from '@/components/ProgramPanel.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import { useRaceLoop } from '@/composables/useRaceLoop'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'

const horsesStore = useHorsesStore()
const race = useRaceStore()

onMounted(() => {
  horsesStore.generateHorses()
})

useRaceLoop()
</script>

<template>
  <div class="app">
    <AppHeader
      :status="race.status"
      :can-start="race.canStart"
      @generate="race.generateSchedule"
      @toggle="race.toggle"
    />

    <main class="layout">
      <BasePanel :title="`Horse List (1 - ${horsesStore.horses.length})`" tone="yellow" class="stable">
        <HorseList :horses="horsesStore.horses" />
      </BasePanel>

      <RaceTrack class="track-area" />

      <div class="side">
        <ProgramPanel />
        <ResultsPanel />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr) 460px;
  gap: 16px;
  padding: 16px;
}

.side {
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Narrow screens: the track goes on top, the lists below it; the page scrolls. */
@media (max-width: 1099px) {
  .app {
    height: auto;
    min-height: 100%;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .track-area {
    order: -1;
    height: 520px;
  }

  .stable {
    max-height: 360px;
  }

  .side {
    height: 420px;
  }
}
</style>
