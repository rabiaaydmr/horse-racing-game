<script setup lang="ts">
defineProps<{
  color: string
  galloping?: boolean
}>()
</script>

<template>
  <!--
    The glyph itself is transparent; what you see is its text-shadow, which takes
    the horse's colour. That turns the emoji into a tintable silhouette.
  -->
  <span class="horse" :class="{ galloping }" :style="{ '--horse-color': color }" aria-hidden="true">
    🐎
  </span>
</template>

<style scoped>
.horse {
  display: inline-block;
  font-size: 30px;
  line-height: 1;
  color: transparent;
  text-shadow:
    0 0 0 var(--horse-color),
    1px 1px 0 rgb(0 0 0 / 45%);
  /* The emoji faces left; the race runs to the right. */
  transform: scaleX(-1);
  user-select: none;
}

.galloping {
  animation: gallop 0.35s ease-in-out infinite alternate;
}

@keyframes gallop {
  from {
    transform: scaleX(-1) translateY(1px) rotate(3deg);
  }
  to {
    transform: scaleX(-1) translateY(-2px) rotate(-3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .galloping {
    animation: none;
  }
}
</style>
