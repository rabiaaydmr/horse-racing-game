<script setup lang="ts">
import { computed } from 'vue'
import HorseIcon from '@/components/HorseIcon.vue'
import type { Horse } from '@/types/race'

const props = defineProps<{
  lane: number
  horse: Horse
  /** Share of the distance covered, 0 (start) to 1 (finish line). */
  progress: number
  galloping: boolean
}>()

const clampedProgress = computed(() => Math.min(Math.max(props.progress, 0), 1))
</script>

<template>
  <div class="lane" data-testid="track-lane">
    <div class="lane-number">{{ lane }}</div>
    <div class="lane-course">
      <div
        class="lane-horse"
        data-testid="lane-horse"
        :data-progress="clampedProgress.toFixed(3)"
        :style="{ '--progress': clampedProgress }"
        :title="`${horse.name} (condition ${horse.condition})`"
      >
        <HorseIcon :color="horse.color.hex" :galloping="galloping && clampedProgress < 1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lane {
  --horse-width: 38px;
  flex: 1;
  display: flex;
  min-height: 0;
}

.lane-number {
  display: grid;
  place-items: center;
  width: 28px;
  background: var(--color-lane-number);
  border-bottom: 1px solid rgb(255 255 255 / 40%);
  color: #fff;
  font-weight: 700;
}

.lane-course {
  position: relative;
  flex: 1;
  border-bottom: 1px dashed rgb(0 0 0 / 45%);
}

.lane-horse {
  position: absolute;
  top: 50%;
  left: calc(var(--progress) * (100% - var(--horse-width)));
  width: var(--horse-width);
  text-align: center;
  transform: translateY(-50%);
}
</style>
