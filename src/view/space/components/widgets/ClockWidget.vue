<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ClassicFace from './clock-faces/ClassicFace.vue'
import MinimalFace from './clock-faces/MinimalFace.vue'
import ModernFace from './clock-faces/ModernFace.vue'
import DigitalFace from './clock-faces/DigitalFace.vue'

const faces = [ClassicFace, MinimalFace, ModernFace, DigitalFace]
const currentFace = computed(() => faces[clockStyle.value])

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

const currentMonth = ref(new Date())
const clockStyle = ref(0)

onMounted(() => {
  timer = setInterval(() => now.value = new Date(), 200)
})

onUnmounted(() => clearInterval(timer))

const slideForward = ref(true)

function nextStyle() {
  slideForward.value = true
  clockStyle.value = (clockStyle.value + 1) % 4
}

function prevStyle() {
  slideForward.value = false
  clockStyle.value = (clockStyle.value - 1 + 4) % 4
}

const dateText = computed(() =>
  now.value.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
)

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }),
)

const dayHeaders = ['一', '二', '三', '四', '五', '六', '日']

interface DayCell {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

const days = computed<DayCell[]>(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  const result: DayCell[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrev - i
    result.push({ day: d, isCurrentMonth: false, isToday: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month}-${d}`
    result.push({ day: d, isCurrentMonth: true, isToday: dateStr === todayStr })
  }

  const remaining = 42 - result.length
  for (let d = 1; d <= remaining; d++) {
    result.push({ day: d, isCurrentMonth: false, isToday: false })
  }

  return result
})

function prevMonth() {
  const m = currentMonth.value.getMonth()
  const y = currentMonth.value.getFullYear()
  currentMonth.value = new Date(y, m - 1, 1)
}

function nextMonth() {
  const m = currentMonth.value.getMonth()
  const y = currentMonth.value.getFullYear()
  currentMonth.value = new Date(y, m + 1, 1)
}
</script>

<template>
  <div class="w-70 px-5 pt-5 pb-4 text-center select-none">
    <!-- 表盘切换行 -->
    <div class="flex items-center justify-center gap-1">
      <button
        class="flex items-center justify-center size-7 rounded-full bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 cursor-pointer"
        @click.stop="prevStyle">
        <ChevronLeft :size="18" />
      </button>

      <div class="flex flex-col items-center min-h-45">
        <Transition enter-active-class="transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          leave-active-class="transition-all duration-[250ms] ease-[cubic-bezier(0.55,0,1,0.45)]"
          :enter-from-class="slideForward ? 'opacity-0 translate-x-6 scale-95 blur-sm' : 'opacity-0 -translate-x-6 scale-95 blur-sm'"
          :leave-to-class="slideForward ? 'opacity-0 -translate-x-6 scale-95 blur-sm' : 'opacity-0 translate-x-6 scale-95 blur-sm'"
          mode="out-in">
          <component :is="currentFace" :now="now" :key="clockStyle" />
        </Transition>
      </div>

      <button
        class="flex items-center justify-center size-7 rounded-full bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 cursor-pointer"
        @click.stop="nextStyle">
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- 日期文本 -->
    <div class="text-[13px] text-muted-foreground mt-1">{{ dateText }}</div>

    <!-- 小日历 -->
    <div class="mt-3 pt-3 border-t border-border">
      <div class="flex items-center justify-between mb-2">
        <button
          class="flex items-center justify-center size-5.5 rounded-[5px] bg-transparent text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
          @click="prevMonth">
          <ChevronLeft :size="14" />
        </button>
        <span class="text-xs font-semibold text-muted-foreground">{{ monthLabel }}</span>
        <button
          class="flex items-center justify-center size-5.5 rounded-[5px] bg-transparent text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
          @click="nextMonth">
          <ChevronRight :size="14" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-px text-center">
        <span v-for="h in dayHeaders" :key="h" class="text-[10px] font-semibold text-muted-foreground py-0.75">{{ h
          }}</span>
        <span v-for="(d, i) in days" :key="i" class="text-[11px] py-0.75 rounded-sm tabular-nums" :class="{
          'bg-primary/10 font-bold text-primary dark:text-primary/80': d.isToday,
          'text-muted-foreground/50 dark:text-muted-foreground/30': !d.isCurrentMonth,
          'text-foreground/70 dark:text-foreground/70': d.isCurrentMonth && !d.isToday,
        }">{{ d.day }}</span>
      </div>
    </div>
  </div>
</template>
