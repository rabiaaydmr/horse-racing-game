<script setup lang="ts">
import type { Horse } from '@/types/race'

defineProps<{
  horses: Horse[]
}>()
</script>

<template>
  <table class="table" data-testid="horse-list">
    <thead>
      <tr>
        <th>Name</th>
        <th>Condition</th>
        <th>Color</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="horse in horses" :key="horse.id" data-testid="horse-row">
        <td>{{ horse.name }}</td>
        <td class="number">{{ horse.condition }}</td>
        <td>
          <span class="swatch" :style="{ backgroundColor: horse.color.hex }" />
          {{ horse.color.name }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  background: var(--color-surface);
  font-size: 12px;
}

.number {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border: 1px solid rgb(0 0 0 / 25%);
  border-radius: 50%;
  vertical-align: -1px;
}
</style>
