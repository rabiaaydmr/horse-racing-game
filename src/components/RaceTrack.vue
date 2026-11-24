<script setup lang="ts">
import { computed } from 'vue'
import TrackLane from '@/components/TrackLane.vue'
import { useHorsesStore } from '@/stores/horses'
import { useRaceStore } from '@/stores/race'
import { roundLabel } from '@/utils/format'

const horsesStore = useHorsesStore()
const race = useRaceStore()

const lanes = computed(() => {
  const round = race.currentRound
  if (!round) return []

  return race.runners.map((runner, index) => ({
    lane: index + 1,
    horse: horsesStore.getHorse(runner.horseId),
    progress: runner.position / round.distance,
  }))
})

const caption = computed(() => {
  const round = race.currentRound
  return round ? roundLabel(round.number, round.distance) : ''
})
</script>

<template>
  <section class="track" data-testid="race-track">
    <p v-if="lanes.length === 0" class="empty">
      Click <strong>Generate Program</strong> to draw the six rounds, then <strong>Start</strong>.
    </p>

    <template v-else>
      <div class="lanes">
        <TrackLane
          v-for="lane in lanes"
          :key="lane.horse.id"
          :lane="lane.lane"
          :horse="lane.horse"
          :progress="lane.progress"
          :galloping="race.isRunning"
        />
      </div>

      <footer class="footer">
        <span data-testid="track-caption">{{ caption }}</span>
        <span class="finish-label">Finish</span>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.track {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  background: var(--color-track);
  border: 1px solid var(--color-border);
}

.empty {
  margin: auto;
  max-width: 320px;
  color: var(--color-muted);
  text-align: center;
  line-height: 1.5;
}

.lanes {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 3px solid var(--color-finish);
}

.footer {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  color: var(--color-finish);
  font-weight: 700;
}

.finish-label {
  text-transform: uppercase;
}
</style>
