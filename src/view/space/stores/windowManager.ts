import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WindowInstance } from '../types'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 560
const MIN_WIDTH = 400
const MIN_HEIGHT = 300

export const useWindowManagerStore = defineStore('windowManager', () => {
  const windows = ref<WindowInstance[]>([])
  let nextZIndex = 10

  const activeWindowId = computed(() => {
    const visible = windows.value.filter((w) => !w.minimized)
    if (!visible.length) return null
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
  })

  function openWindow(appId: string, title: string, options?: Partial<Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'>>): string {
    const id = `${appId}-${Date.now()}`
    const win: WindowInstance = {
      id,
      appId,
      title,
      x: options?.x ?? 120 + (windows.value.length % 6) * 30,
      y: options?.y ?? 80 + (windows.value.length % 6) * 30,
      width: options?.width ?? DEFAULT_WIDTH,
      height: options?.height ?? DEFAULT_HEIGHT,
      minWidth: MIN_WIDTH,
      minHeight: MIN_HEIGHT,
      zIndex: ++nextZIndex,
      minimized: false,
      maximized: false,
    }
    windows.value.push(win)
    return id
  }

  function closeWindow(windowId: string) {
    windows.value = windows.value.filter((w) => w.id !== windowId)
  }

  function focusWindow(windowId: string) {
    const win = windows.value.find((w) => w.id === windowId)
    if (win) win.zIndex = ++nextZIndex
  }

  function minimizeWindow(windowId: string) {
    const win = windows.value.find((w) => w.id === windowId)
    if (win) win.minimized = true
  }

  function maximizeWindow(windowId: string) {
    const win = windows.value.find((w) => w.id === windowId)
    if (!win || win.maximized) return
    // 保存当前几何信息
    win.prevX = win.x
    win.prevY = win.y
    win.prevWidth = win.width
    win.prevHeight = win.height
    win.x = 0
    win.y = 0
    win.width = window.innerWidth
    win.height = window.innerHeight - 60 // 留出 taskbar 空间
    win.maximized = true
    win.zIndex = ++nextZIndex
  }

  function restoreWindow(windowId: string) {
    const win = windows.value.find((w) => w.id === windowId)
    if (!win) return
    if (win.maximized && win.prevWidth != null) {
      win.x = win.prevX!
      win.y = win.prevY!
      win.width = win.prevWidth
      win.height = win.prevHeight!
      win.maximized = false
    }
    win.minimized = false
    win.zIndex = ++nextZIndex
  }

  function moveWindow(windowId: string, x: number, y: number) {
    const win = windows.value.find((w) => w.id === windowId)
    if (win) {
      win.x = x
      win.y = y
    }
  }

  function resizeWindow(windowId: string, width: number, height: number) {
    const win = windows.value.find((w) => w.id === windowId)
    if (win) {
      win.width = Math.max(win.minWidth, width)
      win.height = Math.max(win.minHeight, height)
    }
  }

  function updateWindowTitle(windowId: string, title: string) {
    const win = windows.value.find((w) => w.id === windowId)
    if (win) win.title = title
  }

  function getWindowsForApp(appId: string) {
    return computed(() => windows.value.filter((w) => w.appId === appId))
  }

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
    updateWindowTitle,
    getWindowsForApp,
  }
})
