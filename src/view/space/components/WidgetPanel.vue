<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { X, GripHorizontal } from 'lucide-vue-next'
import { useWidgetStore } from '../stores/widgetStore'
import { useGsap } from '@/composables/useGsap'
import ClockWidget from './widgets/ClockWidget.vue'
import ThemePaletteWidget from './widgets/ThemePaletteWidget.vue'

const props = defineProps<{
  widgetId: string
}>()

const widgetStore = useWidgetStore()
const { gsap, run } = useGsap()
const panelRef = ref<HTMLElement | null>(null)

const widget = computed(() => widgetStore.widgets.find((w) => w.id === props.widgetId)!)
const pos = computed(() => widgetStore.displayPos(widget.value))

const componentMap: Record<string, Component> = {
  clock: ClockWidget,
  'theme-palette': ThemePaletteWidget,
}

const content = computed(() => componentMap[widget.value.widgetType] ?? null)

// ── Drag ──
const dragging = ref(false)

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  widgetStore.focusWidget(props.widgetId)
  const startX = e.clientX
  const startY = e.clientY
  const dp = pos.value
  dragging.value = true

  const onMove = (ev: PointerEvent) => {
    widgetStore.moveWidget(
      props.widgetId,
      dp.x + ev.clientX - startX,
      dp.y + ev.clientY - startY,
    )
  }
  const onUp = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    dragging.value = false
    widgetStore.finishDrag()
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}

// ── Entrance animation ──
onMounted(() => {
  run(() => {
    gsap.from(panelRef.value, {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'back.out(1.4)',
    })
  })
})

function handleClose() {
  run(() => {
    gsap.to(panelRef.value, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => widgetStore.closeWidget(props.widgetId),
    })
  })
}
</script>

<template>
  <div v-if="widget" ref="panelRef" class="widget-panel" :class="{ dragging }" :style="{
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    zIndex: widget.zIndex,
  }" @pointerdown="widgetStore.focusWidget(props.widgetId)">
    <div class="widget-header">
      <button class="widget-drag" title="拖动" @pointerdown.stop="onPointerDown">
        <GripHorizontal :size="14" />
      </button>
      <button class="widget-close" title="关闭" @click.stop="handleClose">
        <X :size="14" />
      </button>
    </div>

    <component :is="content" />
  </div>
</template>

<style scoped>
.widget-panel {
  position: absolute;
  border-radius: 20px;
  background: oklch(1 0 0 / 0.55);
  backdrop-filter: blur(28px) saturate(1.6);
  border: 1px solid oklch(1 0 0 / 0.35);
  box-shadow:
    0 4px 24px oklch(0 0 0 / 0.06),
    0 1px 4px oklch(0 0 0 / 0.03);
  will-change: transform;
}

.widget-panel.dragging {
  opacity: 0.95;
}

.dark .widget-panel {
  background: oklch(0.2 0 0 / 0.6);
  border-color: oklch(1 0 0 / 0.1);
  box-shadow:
    0 4px 24px oklch(0 0 0 / 0.2),
    0 1px 4px oklch(0 0 0 / 0.1);
}

/* ── Header bar ── */
.widget-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 8px 8px 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.widget-panel:hover .widget-header {
  opacity: 1;
}

.widget-drag {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: oklch(0 0 0 / 0.06);
  color: oklch(0.35 0 0);
  cursor: grab;
  transition: background 0.15s ease;
}

.widget-drag:active {
  cursor: grabbing;
}

.widget-drag:hover {
  background: oklch(0 0 0 / 0.12);
  color: oklch(0.15 0 0);
}

.dark .widget-drag {
  background: oklch(1 0 0 / 0.06);
  color: oklch(0.6 0 0);
}

.dark .widget-drag:hover {
  background: oklch(1 0 0 / 0.12);
  color: oklch(0.9 0 0);
}

.widget-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: oklch(0 0 0 / 0.06);
  color: oklch(0.35 0 0);
  cursor: pointer;
  transition: background 0.15s ease;
}

.widget-close:hover {
  background: oklch(0 0 0 / 0.12);
  color: oklch(0.15 0 0);
}

.dark .widget-close {
  background: oklch(1 0 0 / 0.06);
  color: oklch(0.6 0 0);
}

.dark .widget-close:hover {
  background: oklch(1 0 0 / 0.12);
  color: oklch(0.9 0 0);
}
</style>
