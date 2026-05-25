<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted, type Ref, type Component } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import DesktopIcon from './components/DesktopIcon.vue'
import TopBar from './components/TopBar.vue'
import Taskbar from './components/Taskbar.vue'
import AppWindow from './components/AppWindow.vue'
import WidgetPanel from './components/WidgetPanel.vue'
import { useDesktop } from './composables/useDesktop'
import { useWindowManagerStore } from './stores/windowManager'
import { useAppRegistryStore } from './stores/appRegistry'
import { useWidgetStore } from './stores/widgetStore'
import { useThemeColorStore } from './stores/themeColorStore'

const desktopRef = ref<HTMLElement | null>(null)
const { items, gridConfig, gridToPixel, snapToGrid, initItems } = useDesktop(desktopRef)
const wm = useWindowManagerStore()
const registry = useAppRegistryStore()
const widgetStore = useWidgetStore()
const themeColorStore = useThemeColorStore()

const selectedId = ref<string | null>(null)
const sidebarVisible = inject<Ref<boolean>>('sidebarVisible', ref(true))

function handleDockAction(actionId: string) {
  if (actionId === 'toggle-fullscreen') {
    sidebarVisible.value = !sidebarVisible.value
  }
}

/** 从 icon 名称解析为 Vue 组件 */
function resolveIcon(iconName: string): Component {
  return (LucideIcons as unknown as Record<string, Component>)[iconName] ?? LucideIcons.HelpCircle
}

/** 初始化桌面图标 — 合并内置应用和已安装应用 */
function initDesktopItems() {
  registry.loadInstalled()
  const baseItems = registry.allApps.map((app) => ({
    id: app.id,
    name: app.name,
    icon: resolveIcon(app.icon),
    color: app.color,
  }))
  initItems(baseItems)
}

onMounted(() => {
  initDesktopItems()
  window.addEventListener('resize', widgetStore.onResize)
  themeColorStore.loadFromStorage()
  themeColorStore.applyToDOM()
})

onUnmounted(() => {
  window.removeEventListener('resize', widgetStore.onResize)
})

function handleOpen(id: string) {
  const app = registry.getApp(id)
  if (!app) return
  wm.openWindow(id, app.name)
}

function handleTopBarAction(actionId: string) {
  if (actionId === 'settings') {
    // TODO: 打开设置面板
  }
  if (actionId === 'toggle-clock') {
    widgetStore.toggleWidget('clock')
  }
  if (actionId === 'toggle-palette') {
    widgetStore.toggleWidget('theme-palette')
  }
}

function handleDragEnd(id: string, x: number, y: number) {
  snapToGrid(id, x, y)
}

function handleActivateWindow(windowId: string) {
  const w = wm.windows.find((w) => w.id === windowId)
  if (w?.minimized) {
    wm.restoreWindow(windowId)
  } else {
    wm.focusWindow(windowId)
  }
}
</script>

<template>
  <div class="desktop">
    <TopBar @action="handleTopBarAction" />
    <div ref="desktopRef" class="desktop-surface" @click.self="selectedId = null">
      <DesktopIcon v-for="item in items" :key="item.id" :id="item.id" :name="item.name" :icon="item.icon"
        :color="item.color" :x="gridToPixel(item.col, item.row).x" :y="gridToPixel(item.col, item.row).y"
        :cell-size="gridConfig.cellSize" :selected="selectedId === item.id"
        @drag-end="handleDragEnd" @open="handleOpen" @select="selectedId = $event" />

      <!-- Widget 层 -->
      <WidgetPanel v-for="w in widgetStore.widgets" :key="w.id" :widget-id="w.id" />

      <!-- 窗口层 -->
      <AppWindow v-for="win in wm.windows" :key="win.id" :window-id="win.id" :manifest="registry.getApp(win.appId)!" />
    </div>

    <Taskbar :windows="wm.windows" :active-window-id="wm.activeWindowId"
      :get-app="(appId: string) => registry.getApp(appId)" @activate="handleActivateWindow"
      @dock-action="handleDockAction" />
  </div>
</template>

<style scoped>
.desktop {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.desktop-surface {
  position: absolute;
  inset: 0;
  bottom: 0;
}
</style>
