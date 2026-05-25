import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WidgetInstance } from '../types'

const POSITION_KEY = 'auzel-widget-positions'
const MIN_Z = 5
const MAX_Z = 9
const MIN_VISIBLE = 80
const WIDGET_W = 280
const WIDGET_H = 380

function loadPositions(): Record<string, { x: number; y: number }> {
  try {
    return JSON.parse(localStorage.getItem(POSITION_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function savePositions(widgets: WidgetInstance[]) {
  const data: Record<string, { x: number; y: number }> = {}
  for (const w of widgets) {
    data[w.widgetType] = { x: w.x, y: w.y }
  }
  localStorage.setItem(POSITION_KEY, JSON.stringify(data))
}

export const useWidgetStore = defineStore('widgetStore', () => {
  const widgets = ref<WidgetInstance[]>([])
  const viewportW = ref(window.innerWidth)
  const viewportH = ref(window.innerHeight)
  let nextZ = MIN_Z

  function onResize() {
    viewportW.value = window.innerWidth
    viewportH.value = window.innerHeight
  }

  function bumpZ(): number {
    nextZ = nextZ >= MAX_Z ? MIN_Z : nextZ + 1
    return nextZ
  }

  function openWidget(widgetType: string, options?: { x?: number; y?: number }): string {
    const existing = widgets.value.find((w) => w.widgetType === widgetType)
    if (existing) {
      existing.zIndex = bumpZ()
      return existing.id
    }

    const saved = loadPositions()[widgetType]
    const defaultX = (window.innerWidth - WIDGET_W) / 2
    const defaultY = (window.innerHeight - WIDGET_H) / 2
    let x = options?.x ?? saved?.x ?? defaultX
    let y = options?.y ?? saved?.y ?? defaultY
    const maxX = viewportW.value - MIN_VISIBLE
    const maxY = viewportH.value - MIN_VISIBLE
    const minX = MIN_VISIBLE - WIDGET_W
    const minY = MIN_VISIBLE - WIDGET_H
    if (x < minX || x > maxX || y < minY || y > maxY) {
      x = defaultX
      y = defaultY
    }
    const id = `${widgetType}-${Date.now()}`
    widgets.value.push({
      id,
      widgetType,
      x,
      y,
      zIndex: bumpZ(),
    })
    savePositions(widgets.value)
    return id
  }

  function closeWidget(widgetId: string) {
    savePositions(widgets.value)
    widgets.value = widgets.value.filter((w) => w.id !== widgetId)
  }

  function toggleWidget(widgetType: string) {
    const existing = widgets.value.find((w) => w.widgetType === widgetType)
    if (existing) {
      closeWidget(existing.id)
    } else {
      openWidget(widgetType)
    }
  }

  function focusWidget(widgetId: string) {
    const w = widgets.value.find((x) => x.id === widgetId)
    if (w) w.zIndex = bumpZ()
  }

  function moveWidget(widgetId: string, x: number, y: number) {
    const w = widgets.value.find((x) => x.id === widgetId)
    if (w) {
      w.x = x
      w.y = y
    }
  }

  function finishDrag() {
    savePositions(widgets.value)
  }

  /** 渲染用：把存储坐标 clamp 到当前视口内，不改变存储值 */
  function displayPos(w: WidgetInstance): { x: number; y: number } {
    return {
      x: Math.min(Math.max(w.x, MIN_VISIBLE - WIDGET_W), viewportW.value - MIN_VISIBLE),
      y: Math.min(Math.max(w.y, MIN_VISIBLE - WIDGET_H), viewportH.value - MIN_VISIBLE),
    }
  }

  const clockVisible = computed(() => widgets.value.some((w) => w.widgetType === 'clock'))
  const paletteVisible = computed(() => widgets.value.some((w) => w.widgetType === 'theme-palette'))

  return { widgets, viewportW, viewportH, onResize, openWidget, closeWidget, toggleWidget, focusWidget, moveWidget, finishDrag, displayPos, clockVisible, paletteVisible }
})
