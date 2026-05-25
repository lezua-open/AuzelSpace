<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Undo2 } from 'lucide-vue-next'
import { useThemeColorStore } from '../../stores/themeColorStore'
import { generatePalette } from '../../utils/colors'

const store = useThemeColorStore()

const hueSlider = ref(store.hue)
const frostSlider = ref(store.frost)

watch(hueSlider, (val) => {
  store.setHue(val)
})

watch(frostSlider, (val) => {
  store.setFrost(val)
})

// store 变化（如 reset）时同步回滑块
watch(() => store.hue, (val) => {
  hueSlider.value = val
})

watch(() => store.frost, (val) => {
  frostSlider.value = val
})

interface Swatch {
  label: string
  light: string
  dark: string
}

const swatches = computed<Swatch[]>(() => {
  const { light, dark } = generatePalette(hueSlider.value)
  return [
    { label: 'Primary', light: light['--primary'], dark: dark['--primary'] },
    { label: 'Secondary', light: light['--secondary'], dark: dark['--secondary'] },
    { label: 'Accent', light: light['--accent'], dark: dark['--accent'] },
    { label: 'Bg', light: light['--background'], dark: dark['--background'] },
  ]
})

/** 预览用噪点背景 — 灰度 turbulence 完整保留变化 */
const grainPreviewBg = computed(() =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="matrix" values="
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0.33 0.33 0.33 0 0
          0    0    0    1 0
        "/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)"/>
    </svg>`
  )}")`,
)
</script>

<template>
  <div class="flex flex-col gap-4 p-4 select-none">
    <!-- 标题 -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">主题色调</h3>
      <button
        class="flex items-center justify-center size-6 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        title="恢复默认"
        @click.stop="store.reset()"
      >
        <Undo2 :size="13" />
      </button>
    </div>

    <!-- 色调 Hue -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-muted-foreground">色调</span>
        <span class="text-xs text-muted-foreground font-mono">{{ hueSlider }}°</span>
      </div>
      <div class="hue-track-wrapper">
        <div class="hue-track" />
        <input
          v-model.number="hueSlider"
          type="range"
          min="0"
          max="360"
          step="1"
          class="theme-range-input"
        />
      </div>
    </div>

    <!-- 磨砂 Frost -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-muted-foreground">磨砂感</span>
        <span class="text-xs text-muted-foreground font-mono">{{ frostSlider }}</span>
      </div>
      <div class="frost-track-wrapper">
        <div class="frost-track" />
        <input
          v-model.number="frostSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          class="theme-range-input"
        />
        <!-- 磨砂预览方框 -->
        <div class="absolute right-1 top-1/2 -translate-y-1/2 size-4 rounded-sm border border-border overflow-hidden">
          <div class="absolute inset-0" style="background:oklch(0.65 0.08 220)" />
          <div
            class="absolute inset-0"
            :style="{
              backgroundImage: grainPreviewBg,
              backgroundRepeat: 'repeat',
              opacity: frostSlider / 150,
            }"
          />
        </div>
      </div>
    </div>

    <!-- 预览色块：亮/暗对比 -->
    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="s in swatches"
        :key="s.label"
        class="flex flex-col items-center gap-1"
      >
        <span class="text-[10px] text-muted-foreground">{{ s.label }}</span>
        <div class="flex rounded-lg overflow-hidden border border-border shadow-sm">
          <div
            class="size-5"
            :style="{ background: s.light }"
            title="亮色模式"
          />
          <div
            class="size-5"
            :style="{ background: s.dark }"
            title="暗色模式"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── 共用 track wrapper ── */
.hue-track-wrapper,
.frost-track-wrapper {
  position: relative;
  width: 100%;
  height: 22px;
  border-radius: 11px;
  overflow: hidden;
}

/* ── 色调色彩条 ── */
.hue-track {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  background: linear-gradient(
    to right,
    oklch(0.6 0.2 0),
    oklch(0.6 0.2 60),
    oklch(0.6 0.2 120),
    oklch(0.6 0.2 180),
    oklch(0.6 0.2 240),
    oklch(0.6 0.2 300),
    oklch(0.6 0.2 360)
  );
}

/* ── 磨砂强度条：从干净到明显纹理 ── */
.frost-track {
  position: absolute;
  inset: 0;
  border-radius: 11px;
  background: var(--background, oklch(0.985 0 0));
}

.frost-track::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 11px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  mask-image: linear-gradient(to right, transparent 0%, black 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 100%);
}

/* ── 通用 range input ── */
.theme-range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  margin: 0;
  padding: 0;
  border-radius: 11px;
  z-index: 1;
}

.theme-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid oklch(0 0 0 / 0.2);
  box-shadow: 0 1px 4px oklch(0 0 0 / 0.15);
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.theme-range-input::-webkit-slider-thumb:hover {
  box-shadow: 0 1px 8px oklch(0 0 0 / 0.25);
}

.theme-range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid oklch(0 0 0 / 0.2);
  box-shadow: 0 1px 4px oklch(0 0 0 / 0.15);
  cursor: pointer;
}
</style>
