<script setup lang="ts">
import type { Horse } from '@/types/race'

defineProps<{
  title: string
  /** Horses in the order they should be listed (lane order or finishing order). */
  horses: Horse[]
  highlighted?: boolean
}>()
</script>

<template>
  <table class="table" :class="{ highlighted }" data-testid="round-table">
    <caption>
      {{
        title
      }}
    </caption>
    <thead>
      <tr>
        <th class="position">Position</th>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(horse, index) in horses" :key="horse.id">
        <td class="position">{{ index + 1 }}</td>
        <td>{{ horse.name }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

caption {
  padding: 4px;
  background: var(--tone-red);
  font-weight: 600;
}

.highlighted caption {
  background: var(--color-brand);
  color: #fff;
}

th,
td {
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

.position {
  width: 56px;
  text-align: center;
}
</style>
