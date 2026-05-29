<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted, type Ref, type Component } from 'vue'
import { FolderPlus } from 'lucide-vue-next'
import * as LucideIcons from 'lucide-vue-next'
import DesktopIcon from './components/DesktopIcon.vue'
import FolderIcon from './components/FolderIcon.vue'
import FolderPanel from './components/FolderPanel.vue'
import TopBar from './components/TopBar.vue'
import Taskbar from './components/Taskbar.vue'
import AppWindow from './components/AppWindow.vue'
import WidgetPanel from './components/WidgetPanel.vue'
import ContextMenu, { type MenuItem } from './components/ContextMenu.vue'
import { useDesktop } from './composables/useDesktop'
import { useWindowManagerStore } from './stores/windowManager'
import { useAppRegistryStore } from './stores/appRegistry'
import { useWidgetStore } from './stores/widgetStore'
import { useThemeColorStore } from './stores/themeColorStore'

const desktopRef = ref<HTMLElement | null>(null)
const desktop = useDesktop(desktopRef)
const { gridConfig, gridToPixel, snapToGrid, initItems, createFolder, deleteFolder, renameFolder, renameItem, addToFolder, removeFromFolder, getFolder, getFolderItems, visibleItems } = desktop
const wm = useWindowManagerStore()
const registry = useAppRegistryStore()
const widgetStore = useWidgetStore()
const themeColorStore = useThemeColorStore()

const selectedId = ref<string | null>(null)
const sidebarVisible = inject<Ref<boolean>>('sidebarVisible', ref(true))

// 桌面右键菜单
const desktopContextMenu = ref<{ x: number; y: number } | null>(null)
const newFolderPos = ref<{ col: number; row: number } | null>(null)

const desktopMenuItems: MenuItem[] = [
  { id: 'new-folder', label: '新建文件夹', icon: FolderPlus },
]

// 文件夹面板
const folderPanel = ref<string | null>(null) // folderId
const openedFolder = computed(() => {
  if (!folderPanel.value) return null
  const f = getFolder(folderPanel.value)
  if (!f) return null
  return { folder: f, items: getFolderItems(f.id) }
})

// 文件夹悬停高亮
const hoveredFolderId = ref<string | null>(null)

const visibleDesktopItems = computed(() => visibleItems())

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

// ── 图标操作 ──

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

// ── 桌面右键菜单 ──

function onDesktopContextMenu(e: MouseEvent) {
  e.preventDefault()
  const grid = desktop.pixelToGrid(e.clientX, e.clientY)
  newFolderPos.value = { col: grid.col, row: grid.row }
  desktopContextMenu.value = { x: e.clientX, y: e.clientY }
}

function onDesktopMenuSelect(menuId: string) {
  desktopContextMenu.value = null
  if (menuId === 'new-folder' && newFolderPos.value) {
    createFolder(newFolderPos.value.col, newFolderPos.value.row)
  }
}

// ── 文件夹操作 ──

function handleFolderDragEnd(folderId: string, x: number, y: number) {
  const grid = desktop.pixelToGrid(x, y)
  const f = getFolder(folderId)
  if (!f) return
  f.col = Math.min(Math.max(0, grid.col), gridConfig.value.cols - 1)
  f.row = Math.min(Math.max(0, grid.row), gridConfig.value.rows - 1)
  // 存入 localStorage
  desktop.savePositions()
}

function handleFolderOpen(folderId: string) {
  folderPanel.value = folderId
}

function handleFolderDelete(folderId: string) {
  deleteFolder(folderId)
  if (folderPanel.value === folderId) folderPanel.value = null
}

function handleFolderRename(folderId: string, name: string) {
  renameFolder(folderId, name)
}

// ── 拖入文件夹 ──

function handleDropInFolder(itemId: string, folderId: string) {
  addToFolder(folderId, itemId)
}

function handleHoverFolder(folderId: string | null) {
  hoveredFolderId.value = folderId
}

// ── 文件夹面板 ──

function handleRemoveFromFolder(itemId: string) {
  removeFromFolder(itemId)
}

function handleOpenFolderItem(itemId: string) {
  folderPanel.value = null
  handleOpen(itemId)
}

function handleRenameFolderItem(itemId: string, newName: string) {
  renameItem(itemId, newName)
}

// ── 重命名图标 ──

function handleRenameIcon(itemId: string, newName: string) {
  renameItem(itemId, newName)
}
</script>

<template>
  <div class="desktop">
    <TopBar @action="handleTopBarAction" />
    <div
      ref="desktopRef"
      class="desktop-surface"
      @click.self="selectedId = null"
      @contextmenu="onDesktopContextMenu"
    >
      <!-- 应用图标 -->
      <DesktopIcon
        v-for="item in visibleDesktopItems"
        :key="item.id"
        :id="item.id"
        :name="item.name"
        :icon="item.icon"
        :color="item.color"
        :x="gridToPixel(item.col, item.row).x"
        :y="gridToPixel(item.col, item.row).y"
        :cell-size="gridConfig.cellSize"
        :selected="selectedId === item.id"
        @drag-end="handleDragEnd"
        @drop-in-folder="handleDropInFolder"
        @open="handleOpen"
        @delete="registry.uninstallApp(item.id)"
        @rename="handleRenameIcon"
        @select="selectedId = $event"
        @hover-folder="handleHoverFolder"
      />

      <!-- 文件夹图标 -->
      <FolderIcon
        v-for="folder in desktop.folders.value"
        :key="folder.id"
        :folder-id="folder.id"
        :name="folder.name"
        :x="gridToPixel(folder.col, folder.row).x"
        :y="gridToPixel(folder.col, folder.row).y"
        :cell-size="gridConfig.cellSize"
        :hovered="hoveredFolderId === folder.id"
        @drag-end="handleFolderDragEnd"
        @open="handleFolderOpen"
        @delete="handleFolderDelete"
        @rename="handleFolderRename"
      />

      <!-- 桌面右键菜单 -->
      <ContextMenu
        v-if="desktopContextMenu"
        :items="desktopMenuItems"
        :x="desktopContextMenu.x"
        :y="desktopContextMenu.y"
        @select="onDesktopMenuSelect"
        @close="desktopContextMenu = null"
      />

      <!-- Widget 层 -->
      <WidgetPanel v-for="w in widgetStore.widgets" :key="w.id" :widget-id="w.id" />

      <!-- 窗口层 -->
      <AppWindow v-for="win in wm.windows" :key="win.id" :window-id="win.id" :manifest="registry.getApp(win.appId)!" />
    </div>

    <Taskbar :windows="wm.windows" :active-window-id="wm.activeWindowId"
      :get-app="(appId: string) => registry.getApp(appId)" @activate="handleActivateWindow"
      @dock-action="handleDockAction" />

    <!-- 文件夹面板 -->
    <FolderPanel
      v-if="openedFolder"
      :folder-name="openedFolder.folder.name"
      :items="openedFolder.items"
      @close="folderPanel = null"
      @remove-item="handleRemoveFromFolder"
      @open-item="handleOpenFolderItem"
      @rename-item="handleRenameFolderItem"
    />
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
