<script setup lang="ts">
import { toRef } from 'vue'
import { useClockHands } from '@/composables/useClockHands'

const props = defineProps<{ now: Date }>()
const { hourDeg, minuteDeg, secondDeg } = useClockHands(toRef(props, 'now'))
</script>

<template>
  <svg class="classic-face" viewBox="0 0 200 200" width="180" height="180">
    <g class="classic-dial">
      <line v-for="i in 60" :key="i" x1="100" :y1="i % 5 === 0 ? 10 : 13" x2="100" :y2="i % 5 === 0 ? 20 : 17"
        :stroke="i % 5 === 0 ? 'currentColor' : 'var(--tick-minor)'" :stroke-width="i % 5 === 0 ? 1.5 : 0.5"
        stroke-linecap="round" :transform="`rotate(${i * 6}, 100, 100)`" />
    </g>

    <line class="hand-hour" x1="100" y1="100" x2="100" y2="52" :transform="`rotate(${hourDeg}, 100, 100)`" />
    <line class="hand-minute" x1="100" y1="100" x2="100" y2="34" :transform="`rotate(${minuteDeg}, 100, 100)`" />
    <line class="hand-second" x1="100" y1="112" x2="100" y2="28" :transform="`rotate(${secondDeg}, 100, 100)`" />
    <circle cx="100" cy="100" r="4" class="hand-center" />
  </svg>
</template>

<style scoped>
.classic-face {
  color: oklch(0.25 0 0);
  --tick-minor: oklch(0 0 0 / 0.15);
}

:global(.dark) .classic-face {
  color: oklch(0.8 0 0);
  --tick-minor: oklch(1 0 0 / 0.1);
}

.hand-hour {
  stroke: currentColor;
  stroke-width: 3.5;
  stroke-linecap: round;
}

.hand-minute {
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.hand-second {
  stroke: oklch(0.58 0.18 20);
  stroke-width: 1;
  stroke-linecap: round;
}

.hand-center {
  fill: oklch(0.58 0.18 20);
}
</style>
