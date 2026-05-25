<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ now: Date }>()

const colonVisible = ref(true)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => colonVisible.value = !colonVisible.value, 500)
})

onUnmounted(() => clearInterval(timer))

const hours = computed(() => String(props.now.getHours()).padStart(2, '0'))
const minutes = computed(() => String(props.now.getMinutes()).padStart(2, '0'))
const seconds = computed(() => String(props.now.getSeconds()).padStart(2, '0'))

const dayWeek = computed(() =>
  props.now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
)

const date = computed(() => {
  const m = props.now.getMonth() + 1
  const d = props.now.getDate()
  return `${m}/${d}`
})

const is24h = computed(() => props.now.getHours() >= 12)
const ampm = computed(() => (props.now.getHours() >= 12 ? 'PM' : 'AM'))
</script>

<template>
  <div class="w-45 pt-2 pb-1.5 px-2.5 rounded-sm font-mono select-none
      bg-[oklch(0.2_0.005_120)] dark:bg-[oklch(0.16_0.003_120)]
      shadow-[inset_0_1px_3px_oklch(1_0_0/0.08),0_2px_6px_oklch(0_0_0/0.25)]
      dark:shadow-[inset_0_1px_3px_oklch(1_0_0/0.04),0_2px_6px_oklch(0_0_0/0.4)]">
    <!-- 品牌条 -->
    <div
      class="text-[8px] font-bold tracking-[2px] text-[oklch(0.55_0_0)] dark:text-[oklch(0.4_0_0)] text-left pl-0.5 mb-0.5">
      AUSIO
    </div>

    <!-- LCD 屏幕 -->
    <div class="rounded-sm px-2 py-1.5
        bg-[oklch(0.62_0.02_140)] dark:bg-[oklch(0.5_0.015_140)]
        shadow-[inset_0_2px_4px_oklch(0_0_0/0.18),inset_0_-1px_2px_oklch(0_0_0/0.06)]">
      <!-- 状态栏 -->
      <div class="flex gap-1.5 mb-0.5 px-px">
        <span class="text-[7px] font-bold tracking-[0.5px]"
          :class="true ? 'text-[oklch(0.18_0.008_140)] dark:text-[oklch(0.12_0.006_140)]' : 'text-[oklch(0.35_0.008_140)] dark:text-[oklch(0.25_0.006_140)]'">ALM</span>
        <span
          class="text-[7px] font-bold tracking-[0.5px] text-[oklch(0.35_0.008_140)] dark:text-[oklch(0.25_0.006_140)]">♪</span>
        <span class="text-[7px] font-bold tracking-[0.5px]"
          :class="is24h ? 'text-[oklch(0.18_0.008_140)] dark:text-[oklch(0.12_0.006_140)]' : 'text-[oklch(0.35_0.008_140)] dark:text-[oklch(0.25_0.006_140)]'">24H</span>
        <span
          class="text-[7px] font-bold tracking-[0.5px] text-[oklch(0.35_0.008_140)] dark:text-[oklch(0.25_0.006_140)]">▲</span>
      </div>

      <!-- 时间 -->
      <div class="flex items-baseline justify-center gap-0.5 leading-none">
        <span
          class="text-[40px] font-bold tracking-[2px] tabular-nums text-[oklch(0.15_0.008_140)] dark:text-[oklch(0.1_0.006_140)] [text-shadow:0_0_2px_oklch(0_0_0/0.08)]">
          {{ hours }}
        </span>
        <span
          class="text-[36px] font-bold text-[oklch(0.15_0.008_140)] dark:text-[oklch(0.1_0.006_140)] transition-opacity duration-100"
          :class="{ 'opacity-20': !colonVisible }">:</span>
        <span
          class="text-[40px] font-bold tracking-[2px] tabular-nums text-[oklch(0.15_0.008_140)] dark:text-[oklch(0.1_0.006_140)] [text-shadow:0_0_2px_oklch(0_0_0/0.08)]">
          {{ minutes }}
        </span>
        <span
          class="text-[36px] font-bold text-[oklch(0.15_0.008_140)] dark:text-[oklch(0.1_0.006_140)] transition-opacity duration-100"
          :class="{ 'opacity-20': !colonVisible }">:</span>
        <span
          class="text-[22px] font-bold tracking-[2px] tabular-nums text-[oklch(0.15_0.008_140/0.75)] dark:text-[oklch(0.1_0.006_140/0.75)]">
          {{ seconds }}
        </span>
      </div>

      <!-- 日期行 -->
      <div
        class="flex items-center justify-center gap-2 mt-0.5 text-[11px] font-bold tracking-[1px] text-[oklch(0.2_0.008_140)] dark:text-[oklch(0.15_0.006_140)]">
        <span>{{ dayWeek }}</span>
        <span>{{ date }}</span>
        <span class="text-[9px] opacity-70">{{ ampm }}</span>
      </div>
    </div>

    <!-- 底部 -->
    <div class="mt-1 text-center">
      <span
        class="text-[7px] font-semibold tracking-[1.5px] text-[oklch(0.5_0_0)] dark:text-[oklch(0.35_0_0)]">ILLUMINATOR</span>
    </div>
  </div>
</template>
