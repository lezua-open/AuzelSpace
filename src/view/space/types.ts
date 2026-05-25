import type { Component } from 'vue'

/** 已安装应用的配置（持久化） */
export interface AppManifest {
  id: string
  name: string
  icon: string // lucide icon name, e.g. "Pencil"
  color: string
  entry: string // JS bundle URL, or "local:<filename>" for built-in
  description?: string
  version?: string
  author?: string
}

/** 运行时窗口实例（不持久化） */
export interface WindowInstance {
  id: string // unique per open window
  appId: string // references AppManifest.id
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  prevX?: number
  prevY?: number
  prevWidth?: number
  prevHeight?: number
}

/** 桌面 API — 通过 provide/inject 暴露给远程应用 */
export interface DesktopAPI {
  getAppInfo: () => AppManifest
  closeSelf: () => void
  setTitle: (title: string) => void
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
  minimizeSelf: () => void
  maximizeSelf: () => void
}

/** 桌面小组件实例 */
export interface WidgetInstance {
  id: string
  widgetType: string // 内容组件标识，如 "clock"
  x: number
  y: number
  zIndex: number
}

/** 桌面图标项（用于渲染 DesktopIcon） */
export interface DesktopItem {
  id: string
  name: string
  icon: Component
  color: string
  col: number
  row: number
}
