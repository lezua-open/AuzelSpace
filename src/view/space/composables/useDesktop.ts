import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { DesktopItem, DesktopFolder } from '../types'

const CELL_SIZE = 100
const GAP = 8
const PADDING = 24
const STRIDE = CELL_SIZE + GAP
const POSITION_KEY = 'auzel-desktop-grid-positions'
const FOLDER_KEY = 'auzel-desktop-folders'
const RENAME_KEY = 'auzel-desktop-renamed-names'

/**
 * 桌面网格布局 composable — 管理图标位置、网格系统和文件夹。
 */
export function useDesktop(containerRef?: Ref<HTMLElement | null>) {
  const items = ref<DesktopItem[]>([])
  const folders = ref<DesktopFolder[]>([])
  const cols = ref(6)
  const rows = ref(4)

  function recalcGrid() {
    const el = containerRef?.value
    const w = el ? el.clientWidth : window.innerWidth
    const h = el ? el.clientHeight : window.innerHeight
    cols.value = Math.max(1, Math.floor((w - PADDING * 2 + GAP) / STRIDE))
    rows.value = Math.max(1, Math.floor((h - PADDING * 2 + GAP) / STRIDE))
  }

  const gridConfig = computed(() => ({
    cols: cols.value,
    rows: rows.value,
    cellSize: CELL_SIZE,
    gap: GAP,
    padding: PADDING,
  }))

  function loadPositions(): Record<string, { col: number; row: number }> {
    try {
      const raw = localStorage.getItem(POSITION_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function savePositions() {
    const positions: Record<string, { col: number; row: number }> = {}
    for (const item of items.value) {
      positions[item.id] = { col: item.col, row: item.row }
    }
    localStorage.setItem(POSITION_KEY, JSON.stringify(positions))
  }

  // ── 文件夹持久化 ──

  function loadFolders(): DesktopFolder[] {
    try {
      const raw = localStorage.getItem(FOLDER_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveFolders() {
    localStorage.setItem(FOLDER_KEY, JSON.stringify(folders.value))
  }

  // ── 重命名持久化 ──

  function loadRenamedNames(): Record<string, string> {
    try {
      const raw = localStorage.getItem(RENAME_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveRenamedNames(names: Record<string, string>) {
    localStorage.setItem(RENAME_KEY, JSON.stringify(names))
  }

  /** 重命名桌面图标并持久化 */
  function renameItem(id: string, name: string) {
    const item = items.value.find((x) => x.id === id)
    if (!item) return
    item.name = name
    const names = loadRenamedNames()
    names[id] = name
    saveRenamedNames(names)
  }

  // ── 文件夹操作 ──

  function createFolder(col: number, row: number): DesktopFolder {
    const folder: DesktopFolder = {
      id: `folder-${Date.now()}`,
      name: '新建文件夹',
      col,
      row,
    }
    folders.value.push(folder)
    saveFolders()
    return folder
  }

  function deleteFolder(id: string) {
    // 文件夹内的图标回归桌面
    for (const item of items.value) {
      if (item.folderId === id) {
        item.folderId = undefined
      }
    }
    folders.value = folders.value.filter((f) => f.id !== id)
    savePositions()
    saveFolders()
  }

  function renameFolder(id: string, name: string) {
    const f = folders.value.find((x) => x.id === id)
    if (f) {
      f.name = name
      saveFolders()
    }
  }

  function addToFolder(folderId: string, itemId: string) {
    const item = items.value.find((x) => x.id === itemId)
    if (item) {
      item.folderId = folderId
      savePositions()
    }
  }

  function removeFromFolder(itemId: string) {
    const item = items.value.find((x) => x.id === itemId)
    if (item) {
      item.folderId = undefined
      savePositions()
    }
  }

  function getFolder(id: string): DesktopFolder | undefined {
    return folders.value.find((f) => f.id === id)
  }

  function getFolderItems(folderId: string): DesktopItem[] {
    return items.value.filter((x) => x.folderId === folderId)
  }

  /** 桌面可见图标 — 排除已放入文件夹的 */
  function visibleItems(): DesktopItem[] {
    return items.value.filter((x) => !x.folderId)
  }

  /** 查找指定网格位置是否有文件夹 */
  function getFolderAt(col: number, row: number): DesktopFolder | undefined {
    return folders.value.find((f) => f.col === col && f.row === row)
  }

  // ── 图标管理 ──

  function initItems(baseItems: Omit<DesktopItem, 'col' | 'row'>[]) {
    recalcGrid()
    const saved = loadPositions()
    const existingFolders = loadFolders()
    const renamedNames = loadRenamedNames()
    folders.value = existingFolders

    items.value = baseItems.map((item, i) => ({
      ...item,
      name: renamedNames[item.id] ?? item.name,
      col: saved[item.id]?.col ?? i % cols.value,
      row: saved[item.id]?.row ?? Math.floor(i / cols.value),
    }))
  }

  function gridToPixel(col: number, row: number) {
    return {
      x: PADDING + col * STRIDE,
      y: PADDING + row * STRIDE,
    }
  }

  function pixelToGrid(x: number, y: number) {
    return {
      col: Math.max(0, Math.round((x - PADDING) / STRIDE)),
      row: Math.max(0, Math.round((y - PADDING) / STRIDE)),
    }
  }

  function snapToGrid(id: string, pixelX: number, pixelY: number) {
    const grid = pixelToGrid(pixelX, pixelY)
    const targetCol = Math.min(grid.col, cols.value - 1)
    const targetRow = Math.min(Math.max(0, grid.row), rows.value - 1)

    const item = items.value.find((a) => a.id === id)
    if (!item) return

    // 如果目标格已被其他图标占据，则交换位置
    const occupant = items.value.find(
      (a) => a.id !== id && !a.folderId && a.col === targetCol && a.row === targetRow,
    )

    if (occupant) {
      occupant.col = item.col
      occupant.row = item.row
    }

    item.col = targetCol
    item.row = targetRow
    savePositions()
  }

  function getItemPixelPos(id: string) {
    const item = items.value.find((a) => a.id === id)
    if (!item) return { x: 0, y: 0 }
    return gridToPixel(item.col, item.row)
  }

  function onResize() {
    recalcGrid()
    for (const item of items.value) {
      item.col = Math.min(item.col, cols.value - 1)
      item.row = Math.min(item.row, rows.value - 1)
    }
    for (const folder of folders.value) {
      folder.col = Math.min(folder.col, cols.value - 1)
      folder.row = Math.min(folder.row, rows.value - 1)
    }
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    items,
    folders,
    gridConfig,
    gridToPixel,
    pixelToGrid,
    snapToGrid,
    getItemPixelPos,
    initItems,
    savePositions,
    renameItem,
    // 文件夹
    createFolder,
    deleteFolder,
    renameFolder,
    addToFolder,
    removeFromFolder,
    getFolder,
    getFolderItems,
    getFolderAt,
    visibleItems,
  }
}
