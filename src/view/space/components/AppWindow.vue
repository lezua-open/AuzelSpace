<script setup lang="ts">
import { ref, onMounted, watch, provide, shallowRef, type Component } from 'vue'
import { Minus, Square, X, Copy } from 'lucide-vue-next'
import { useWindowManagerStore } from '../stores/windowManager'
import { useAppLoader } from '../composables/useAppLoader'
import { useGsap } from '@/composables/useGsap'
import type { AppManifest, DesktopAPI } from '../types'

const props = defineProps<{
  windowId: string
  manifest: AppManifest
}>()

const wm = useWindowManagerStore()
const { loadApp } = useAppLoader()
const { gsap, run } = useGsap()
const windowEl = ref<HTMLElement | null>(null)
const appComponent = shallowRef<Component | null>(null)
const loading = ref(true)
const loadError = ref('')

const win = () => wm.windows.find((w) => w.id === props.windowId)!

// 提供给子应用的桌面 API
const desktopAPI: DesktopAPI = {
  getAppInfo: () => ({ ...props.manifest }),
  closeSelf: () => handleClose(),
  setTitle: (title: string) => wm.updateWindowTitle(props.windowId, title),
  notify: (msg, type = 'info') => console.log(`[Notify ${type}]`, msg),
  minimizeSelf: () => handleMinimize(),
  maximizeSelf: () => handleMaximize(),
}
provide('desktopAPI', desktopAPI)

// 加载应用组件
onMounted(async () => {
  try {
    appComponent.value = await loadApp(props.manifest)
  } catch (e: any) {
    loadError.value = e.message ?? '加载失败'
  } finally {
    loading.value = false
  }

  // 打开动画
  run(() => {
    gsap.from(windowEl.value, {
      scale: 0.92,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.out',
    })
  })
})

// ── 拖拽 ──
let dragOffsetX = 0
let dragOffsetY = 0

function onTitlePointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const w = win()
  if (w.maximized) return

  dragOffsetX = e.clientX - w.x
  dragOffsetY = e.clientY - w.y
  wm.focusWindow(props.windowId)

  const onMove = (ev: PointerEvent) => {
    wm.moveWindow(props.windowId, ev.clientX - dragOffsetX, ev.clientY - dragOffsetY)
  }
  const onUp = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}

function onTitleDblClick() {
  handleMaximize()
}

// ── 缩放 ──
function onResizeStart(e: PointerEvent, direction: string) {
  e.preventDefault()
  e.stopPropagation()
  const w = win()
  const startX = e.clientX
  const startY = e.clientY
  const startW = w.width
  const startH = w.height
  const startLeft = w.x
  const startTop = w.y

  wm.focusWindow(props.windowId)

  const onMove = (ev: PointerEvent) => {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY

    let newW = startW
    let newH = startH
    let newX = startLeft
    let newY = startTop

    if (direction.includes('e')) newW = startW + dx
    if (direction.includes('s')) newH = startH + dy
    if (direction.includes('w')) { newW = startW - dx; newX = startLeft + dx }
    if (direction.includes('n')) { newH = startH - dy; newY = startTop + dy }

    if (newW >= w.minWidth) {
      w.width = newW
      if (direction.includes('w')) w.x = newX
    }
    if (newH >= w.minHeight) {
      w.height = newH
      if (direction.includes('n')) w.y = newY
    }
  }

  const onUp = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
  }
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}

// ── 窗口操作 ──
function handleClose() {
  run(() => {
    gsap.to(windowEl.value, {
      scale: 0.95,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => wm.closeWindow(props.windowId),
    })
  })
}

function handleMinimize() {
  run(() => {
    gsap.to(windowEl.value, {
      scale: 0.85,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        wm.minimizeWindow(props.windowId)
        // 重置样式以便下次显示
        if (windowEl.value) {
          gsap.set(windowEl.value, { scale: 1, opacity: 1 })
        }
      },
    })
  })
}

function handleMaximize() {
  const w = win()
  if (w.maximized) {
    wm.restoreWindow(props.windowId)
  } else {
    wm.maximizeWindow(props.windowId)
  }
}

function handleSurfaceClick() {
  wm.focusWindow(props.windowId)
}
</script>

<template>
  <div
    v-if="!win()?.minimized"
    ref="windowEl"
    class="app-window"
    :class="{ maximized: win()?.maximized }"
    :style="{
      left: `${win()?.x}px`,
      top: `${win()?.y}px`,
      width: `${win()?.width}px`,
      height: `${win()?.height}px`,
      zIndex: win()?.zIndex,
    }"
    @mousedown="handleSurfaceClick"
  >
    <!-- 标题栏 -->
    <div
      class="title-bar"
      @pointerdown="onTitlePointerDown"
      @dblclick="onTitleDblClick"
    >
      <div class="title-bar-left">
        <span class="title-dot" :style="{ background: manifest.color }" />
        <span class="title-text">{{ win()?.title }}</span>
      </div>
      <div class="title-bar-actions">
        <button class="title-btn" title="最小化" @click.stop="handleMinimize">
          <Minus :size="14" />
        </button>
        <button class="title-btn" title="最大化" @click.stop="handleMaximize">
          <Square :size="12" />
        </button>
        <button class="title-btn title-btn-close" title="关闭" @click.stop="handleClose">
          <X :size="14" />
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="window-content">
      <div v-if="loading" class="window-loading">
        <div class="spinner" />
      </div>
      <div v-else-if="loadError" class="window-error">
        {{ loadError }}
      </div>
      <Suspense v-else>
        <component :is="appComponent" />
        <template #fallback>
          <div class="window-loading"><div class="spinner" /></div>
        </template>
      </Suspense>
    </div>

    <!-- 缩放 handles -->
    <template v-if="!win()?.maximized">
      <div class="resize-handle resize-n" @pointerdown="onResizeStart($event, 'n')" />
      <div class="resize-handle resize-s" @pointerdown="onResizeStart($event, 's')" />
      <div class="resize-handle resize-e" @pointerdown="onResizeStart($event, 'e')" />
      <div class="resize-handle resize-w" @pointerdown="onResizeStart($event, 'w')" />
      <div class="resize-handle resize-ne" @pointerdown="onResizeStart($event, 'ne')" />
      <div class="resize-handle resize-nw" @pointerdown="onResizeStart($event, 'nw')" />
      <div class="resize-handle resize-se" @pointerdown="onResizeStart($event, 'se')" />
      <div class="resize-handle resize-sw" @pointerdown="onResizeStart($event, 'sw')" />
    </template>
  </div>
</template>

<style scoped>
.app-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: oklch(0.98 0 0);
  border: 1px solid oklch(0.9 0 0);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.12),
              0 2px 8px oklch(0 0 0 / 0.06);
  will-change: transform;
}

.dark .app-window {
  background: oklch(0.16 0 0);
  border-color: oklch(0.28 0 0);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.4),
              0 2px 8px oklch(0 0 0 / 0.2);
}

.app-window.maximized {
  border-radius: 0;
}

/* ── 标题栏 ── */
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 10px;
  background: oklch(0.96 0 0);
  border-bottom: 1px solid oklch(0.9 0 0);
  cursor: default;
  user-select: none;
  flex-shrink: 0;
}

.dark .title-bar {
  background: oklch(0.19 0 0);
  border-bottom-color: oklch(0.25 0 0);
}

.title-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.title-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.title-text {
  font-size: 12px;
  font-weight: 500;
  color: oklch(0.35 0 0);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .title-text {
  color: oklch(0.75 0 0);
}

.title-bar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.title-btn {
  width: 28px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: oklch(0.5 0 0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.title-btn:hover {
  background: oklch(0.9 0 0);
  color: oklch(0.3 0 0);
}

.dark .title-btn {
  color: oklch(0.55 0 0);
}

.dark .title-btn:hover {
  background: oklch(0.25 0 0);
  color: oklch(0.8 0 0);
}

.title-btn-close:hover {
  background: oklch(0.6 0.15 25);
  color: white;
}

.dark .title-btn-close:hover {
  background: oklch(0.55 0.15 25);
  color: white;
}

/* ── 内容区 ── */
.window-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.window-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid oklch(0.85 0 0);
  border-top-color: oklch(0.45 0 0);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.dark .spinner {
  border-color: oklch(0.3 0 0);
  border-top-color: oklch(0.7 0 0);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.window-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: oklch(0.55 0.15 25);
  font-size: 13px;
  padding: 16px;
  text-align: center;
}

/* ── 缩放 handles ── */
.resize-handle {
  position: absolute;
}

.resize-n { top: -3px; left: 8px; right: 8px; height: 6px; cursor: n-resize; }
.resize-s { bottom: -3px; left: 8px; right: 8px; height: 6px; cursor: s-resize; }
.resize-e { right: -3px; top: 8px; bottom: 8px; width: 6px; cursor: e-resize; }
.resize-w { left: -3px; top: 8px; bottom: 8px; width: 6px; cursor: w-resize; }
.resize-ne { top: -3px; right: -3px; width: 12px; height: 12px; cursor: ne-resize; }
.resize-nw { top: -3px; left: -3px; width: 12px; height: 12px; cursor: nw-resize; }
.resize-se { bottom: -3px; right: -3px; width: 12px; height: 12px; cursor: se-resize; }
.resize-sw { bottom: -3px; left: -3px; width: 12px; height: 12px; cursor: sw-resize; }
</style>
