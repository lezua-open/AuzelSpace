<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Maximize2 } from 'lucide-vue-next'
import type { WindowInstance, AppManifest } from '../types'

const props = defineProps<{
  windows: WindowInstance[]
  activeWindowId: string | null
  getApp: (appId: string) => AppManifest | undefined
}>()

const emit = defineEmits<{
  activate: [windowId: string]
  'dock-action': [actionId: string]
}>()

const actions = [
  { id: 'toggle-fullscreen' as const, icon: Maximize2, title: '全屏' },
]

const time = ref('')
let timer: ReturnType<typeof setInterval>

function updateTime() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 30000)
})

onUnmounted(() => clearInterval(timer))

/** 按 appId 分组，取每组最顶层的窗口 */
function getGroupedWindows() {
  const groups = new Map<string, WindowInstance[]>()
  for (const w of props.windows) {
    const arr = groups.get(w.appId) ?? []
    arr.push(w)
    groups.set(w.appId, arr)
  }
  return Array.from(groups.entries()).map(([appId, wins]) => ({
    appId,
    app: props.getApp(appId),
    windows: wins,
    topWindow: wins.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)),
    isActive: wins.some((w) => w.id === props.activeWindowId),
  }))
}
</script>

<template>
  <div class="dock-wrapper">
    <div class="dock">
      <div class="dock-items">
        <div v-for="group in getGroupedWindows()" :key="group.appId" class="dock-group">
          <button class="dock-item" :class="{ active: group.isActive }" :title="group.app?.name ?? group.appId"
            @click="emit('activate', group.topWindow.id)">
            <span class="dock-dot" :style="{ background: group.app?.color ?? '#888' }" />
          </button>
          <!-- 多窗口指示器 -->
          <span v-if="group.windows.length > 1" class="dock-multi" />
        </div>
      </div>

      <div class="dock-separator" />

      <button v-for="action in actions" :key="action.id" class="dock-item dock-action" :title="action.title"
        @click="emit('dock-action', action.id)">
        <component :is="action.icon" class="dock-action-icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dock-wrapper {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

.dock {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 20px;
  background: oklch(1 0 0 / 0.35);
  backdrop-filter: blur(30px) saturate(1.8);
  border: 1px solid oklch(1 0 0 / 0.3);
  box-shadow: 0 4px 24px oklch(0 0 0 / 0.08),
    0 1px 4px oklch(0 0 0 / 0.04);
}

.dark .dock {
  background: oklch(0.18 0 0 / 0.45);
  border-color: oklch(1 0 0 / 0.1);
  box-shadow: 0 4px 24px oklch(0 0 0 / 0.2),
    0 1px 4px oklch(0 0 0 / 0.1);
}

.dock-items {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dock-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dock-item {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}

.dock-item:hover {
  background: oklch(1 0 0 / 0.2);
  transform: translateY(-2px);
}

.dark .dock-item:hover {
  background: oklch(1 0 0 / 0.1);
}

.dock-item.active {
  background: oklch(1 0 0 / 0.25);
}

.dark .dock-item.active {
  background: oklch(1 0 0 / 0.12);
}

.dock-item:active {
  transform: scale(0.92);
}

.dock-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.15);
}

.dock-multi {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: oklch(0.6 0 0);
}

.dark .dock-multi {
  background: oklch(0.5 0 0);
}

.dock-separator {
  width: 1px;
  height: 24px;
  background: oklch(0 0 0 / 0.1);
  margin: 0 4px;
}

.dark .dock-separator {
  background: oklch(1 0 0 / 0.1);
}

.dock-action {
  color: oklch(0.4 0 0);
}

.dark .dock-action {
  color: oklch(0.6 0 0);
}

.dock-action:hover {
  color: oklch(0.2 0 0);
}

.dark .dock-action:hover {
  color: oklch(0.85 0 0);
}

.dock-action-icon {
  width: 16px;
  height: 16px;
}
</style>
