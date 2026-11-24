<script setup lang="ts">
defineProps<{
  title: string
  tone: 'yellow' | 'blue' | 'green'
}>()
</script>

<template>
  <section class="panel">
    <h2 class="panel-title" :class="`tone-${tone}`">{{ title }}</h2>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.panel-title {
  margin: 0;
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
}

.tone-yellow {
  background: var(--tone-yellow);
}

.tone-blue {
  background: var(--tone-blue);
}

.tone-green {
  background: var(--tone-green);
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
