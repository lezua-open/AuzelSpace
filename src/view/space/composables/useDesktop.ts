import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { DesktopItem } from '../types'

const CELL_SIZE = 100
const GAP = 8
const PADDING = 24
const STRIDE = CELL_SIZE + GAP
const POSITION_KEY = 'auzel-desktop-grid-positions'

/**
 * 桌面网格布局 composable — 管理图标位置和网格系统。
 * 窗口管理已移至 windowManager store。
 */
export function useDesktop(containerRef?: Ref<HTMLElement | null>) {
  const items = ref<DesktopItem[]>([])
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

  /** 初始化桌面图标 — 由外部传入基础数据，自动分配网格位置 */
  function initItems(baseItems: Omit<DesktopItem, 'col' | 'row'>[]) {
    recalcGrid()
    const saved = loadPositions()
    items.value = baseItems.map((item, i) => ({
      ...item,
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
      (a) => a.id !== id && a.col === targetCol && a.row === targetRow,
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
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    items,
    gridConfig,
    gridToPixel,
    snapToGrid,
    getItemPixelPos,
    initItems,
  }
}
