<script setup lang="ts">
import { toRef } from 'vue'
import { useClockHands } from '@/composables/useClockHands'

const props = defineProps<{ now: Date }>()
const { hourDeg, minuteDeg, secondDeg } = useClockHands(toRef(props, 'now'))
</script>

<template>
  <svg class="modern-face" viewBox="0 0 200 200" width="180" height="180">
    <circle cx="100" cy="100" r="88" class="clock-dial" />
    <circle v-for="i in 12" :key="i" cx="100" cy="18" :r="i % 3 === 0 ? 3.5 : 2"
      :class="i % 3 === 0 ? 'clock-hdot' : 'clock-mdot'" :transform="`rotate(${i * 30}, 100, 100)`" />

    <line class="hand-hour" x1="100" y1="100" x2="100" y2="52" :transform="`rotate(${hourDeg}, 100, 100)`" />
    <line class="hand-minute" x1="100" y1="100" x2="100" y2="34" :transform="`rotate(${minuteDeg}, 100, 100)`" />
    <line class="hand-second" x1="100" y1="112" x2="100" y2="28" :transform="`rotate(${secondDeg}, 100, 100)`" />
    <circle cx="100" cy="100" r="4" class="hand-center" />
  </svg>
</template>

<style scoped>
.clock-dial {
  fill: oklch(0.15 0 0);
}

.clock-hdot {
  fill: oklch(1 0 0);
}

.clock-mdot {
  fill: oklch(1 0 0 / 0.35);
}

:global(.dark) .clock-dial {
  fill: oklch(0.95 0 0);
}

:global(.dark) .clock-hdot {
  fill: oklch(0.15 0 0);
}

:global(.dark) .clock-mdot {
  fill: oklch(0.15 0 0 / 0.3);
}

.hand-hour {
  stroke: oklch(1 0 0);
  stroke-width: 4;
  stroke-linecap: round;
}

.hand-minute {
  stroke: oklch(1 0 0);
  stroke-width: 3;
  stroke-linecap: round;
}

.hand-second {
  stroke: oklch(0.6 0.2 230);
  stroke-width: 1;
  stroke-linecap: round;
}

.hand-center {
  fill: oklch(0.6 0.2 230);
}

:global(.dark) .hand-hour {
  stroke: oklch(0.15 0 0);
}

:global(.dark) .hand-minute {
  stroke: oklch(0.15 0 0);
}
</style>
