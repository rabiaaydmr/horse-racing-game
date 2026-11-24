<script setup lang="ts">
import { computed } from 'vue'
import type { RaceStatus } from '@/types/race'

const props = defineProps<{
  status: RaceStatus
  canStart: boolean
}>()

const emit = defineEmits<{
  generate: []
  toggle: []
}>()

const toggleLabel = computed(() => {
  if (props.status === 'running') return 'Pause'
  if (props.status === 'paused') return 'Resume'
  return 'Start'
})
</script>

<template>
  <header class="header">
    <h1 class="title">Horse Racing</h1>

    <div class="actions">
      <button type="button" class="button" data-testid="generate-button" @click="emit('generate')">
        Generate Program
      </button>
      <button
        type="button"
        class="button"
        data-testid="toggle-button"
        :disabled="!canStart"
        @click="emit('toggle')"
      >
        {{ toggleLabel }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--tone-red);
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 12px;
}

.button {
  min-width: 150px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
}

.button:hover:not(:disabled) {
  background: #f3f4f6;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
