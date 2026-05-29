<script setup lang="ts">
import { ref } from 'vue'
import { X, FolderOpen, Pencil, ExternalLink, Trash2 } from 'lucide-vue-next'
import ContextMenu, { type MenuItem } from './ContextMenu.vue'
import { useInlineRename } from '../composables/useInlineRename'
import type { DesktopItem } from '../types'

const props = defineProps<{
  folderName: string
  items: DesktopItem[]
}>()

const emit = defineEmits<{
  close: []
  removeItem: [itemId: string]
  openItem: [itemId: string]
  renameItem: [itemId: string, name: string]
}>()

const panelRef = ref<HTMLElement | null>(null)

// ── 右键菜单 ──
const contextMenu = ref<{ x: number; y: number; itemId: string } | null>(null)
const menuItems: MenuItem[] = [
  { id: 'open', label: '打开', icon: ExternalLink },
  { id: 'rename', label: '重命名', icon: Pencil },
  { id: 'divider', label: '', divider: true },
  { id: 'delete', label: '移出文件夹', icon: Trash2, danger: true },
]

// ── 内联重命名 ──
const {
  renamingId,
  inputRef: renameInputRef,
  startRename,
  finishRename: _finishRename,
  onKeydown: _onRenameKeydown,
} = useInlineRename({
  onComplete: (id, newName) => emit('renameItem', id, newName),
})

function getCurrentName(id: string) {
  return props.items.find((x) => x.id === id)?.name ?? ''
}

function finishRename() {
  _finishRename(getCurrentName)
}

function onRenameKeydown(e: KeyboardEvent) {
  _onRenameKeydown(e, getCurrentName)
}

// ── 拖出文件夹 ──
const draggingOutId = ref<string | null>(null)

/** 拖拽图标到面板外 40px 即视为移出文件夹 */
function onItemDragStart(itemId: string) {
  const panel = panelRef.value
  if (!panel) return

  const rect = panel.getBoundingClientRect()
  let removed = false

  const onMove = (ev: PointerEvent) => {
    if (removed) return
    const out =
      ev.clientX < rect.left - 40 || ev.clientX > rect.right + 40 ||
      ev.clientY < rect.top - 40 || ev.clientY > rect.bottom + 40
    if (out) {
      removed = true
      draggingOutId.value = null
      emit('removeItem', itemId)
      cleanup()
    }
  }

  const onUp = () => {
    draggingOutId.value = null
    cleanup()
  }

  const cleanup = () => {
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
  }

  draggingOutId.value = itemId
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}

function onItemDblClick(itemId: string) {
  if (!renamingId.value) emit('openItem', itemId)
}

function onItemContextMenu(itemId: string, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  contextMenu.value = { x: e.clientX, y: e.clientY, itemId }
}

function onMenuSelect(menuId: string) {
  const itemId = contextMenu.value?.itemId
  contextMenu.value = null
  if (!itemId) return
  if (menuId === 'open') emit('openItem', itemId)
  if (menuId === 'rename') startRename(itemId)
  if (menuId === 'delete') emit('removeItem', itemId)
}

// ── 重命名逻辑已提取到 useInlineRename composable ──
</script>

<template>
  <Teleport to="body">
    <div class="folder-panel-overlay" @pointerdown.self="emit('close')">
      <div ref="panelRef" class="folder-panel">
        <!-- 标题栏 -->
        <div class="panel-header">
          <div class="panel-header-left">
            <FolderOpen class="panel-header-icon" />
            <span class="panel-title">{{ folderName }}</span>
            <span class="panel-count">({{ items.length }})</span>
          </div>
          <button class="panel-close" title="关闭" @click="emit('close')">
            <X :size="14" />
          </button>
        </div>

        <!-- 空文件夹提示 -->
        <div v-if="items.length === 0" class="panel-empty">拖拽应用到此处</div>

        <!-- 图标网格 -->
        <div v-else class="panel-grid">
          <div
            v-for="item in items"
            :key="item.id"
            class="panel-item"
            :class="{ 'dragging-out': draggingOutId === item.id }"
            @pointerdown="onItemDragStart(item.id)"
            @dblclick="onItemDblClick(item.id)"
            @contextmenu="onItemContextMenu(item.id, $event)"
          >
            <div class="panel-icon-box" :style="{ background: item.color }">
              <div class="panel-icon-gloss" />
              <component :is="item.icon" class="panel-icon-svg" />
            </div>

            <!-- 标签 / 重命名 -->
            <span
              v-if="renamingId !== item.id"
              class="panel-item-label"
              @dblclick.stop="startRename(item.id)"
            >{{ item.name }}</span>
            <span
              v-else
              ref="renameInputRef"
              class="panel-item-label panel-item-label-edit"
              contenteditable="true"
              spellcheck="false"
              @blur="finishRename"
              @keydown="onRenameKeydown"
              @pointerdown.stop
            >{{ item.name }}</span>
          </div>
        </div>

        <!-- 右键菜单 -->
        <ContextMenu
          v-if="contextMenu"
          :items="menuItems"
          :x="contextMenu.x"
          :y="contextMenu.y"
          @select="onMenuSelect"
          @close="contextMenu = null"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ── */
.folder-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0 0 0 / 0.2);
}

/* ── Panel ── */
.folder-panel {
  width: 340px;
  min-height: 180px;
  max-height: 420px;
  border-radius: 20px;
  background: oklch(1 0 0 / 0.75);
  backdrop-filter: blur(36px) saturate(2);
  border: 1px solid oklch(1 0 0 / 0.35);
  box-shadow: 0 8px 40px oklch(0 0 0 / 0.12), 0 2px 8px oklch(0 0 0 / 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dark .folder-panel {
  background: oklch(0.22 0 0 / 0.8);
  border-color: oklch(1 0 0 / 0.08);
}

/* ── Header ── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid oklch(0 0 0 / 0.08);
}

.dark .panel-header {
  border-bottom-color: oklch(1 0 0 / 0.06);
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header-icon {
  width: 16px;
  height: 16px;
  color: oklch(0.55 0.15 250);
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: oklch(0.2 0 0);
}

.dark .panel-title {
  color: oklch(0.9 0 0);
}

.panel-count {
  font-size: 12px;
  color: oklch(0.5 0 0);
}

.dark .panel-count {
  color: oklch(0.6 0 0);
}

.panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: oklch(0 0 0 / 0.06);
  color: oklch(0.35 0 0);
  cursor: pointer;
  transition: background 0.15s;
}

.panel-close:hover {
  background: oklch(0 0 0 / 0.12);
}

.dark .panel-close {
  background: oklch(1 0 0 / 0.06);
  color: oklch(0.7 0 0);
}

/* ── Empty state ── */
.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 128px;
  font-size: 14px;
  color: oklch(0.5 0 0);
}

.dark .panel-empty {
  color: oklch(0.6 0 0);
}

/* ── Grid ── */
.panel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  overflow-y: auto;
}

.panel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 10px;
  cursor: grab;
  transition: background 0.15s;
}

.panel-item:hover {
  background: oklch(0 0 0 / 0.04);
}

.dark .panel-item:hover {
  background: oklch(1 0 0 / 0.04);
}

.panel-item.dragging-out {
  opacity: 0.3;
}

/* ── Icon ── */
.panel-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.1), inset 0 1px 0 oklch(1 0 0 / 0.2);
}

.panel-icon-gloss {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, oklch(1 0 0 / 0.2) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

.panel-icon-svg {
  width: 22px;
  height: 22px;
  color: white;
  stroke-width: 2;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.15));
}

/* ── Label ── */
.panel-item-label {
  font-size: 10px;
  color: oklch(0.3 0 0);
  text-align: center;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .panel-item-label {
  color: oklch(0.8 0 0);
}

.panel-item-label-edit {
  outline: 2px solid oklch(0.5 0.15 250);
  background: oklch(1 0 0 / 0.9);
  white-space: pre;
  overflow: visible;
  min-width: 40px;
}

.dark .panel-item-label-edit {
  background: oklch(0.25 0 0 / 0.95);
  color: oklch(0.95 0 0);
}
</style>
