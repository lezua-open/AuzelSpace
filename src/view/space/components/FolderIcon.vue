<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, FolderOpen, Pencil, Trash2 } from 'lucide-vue-next'
import ContextMenu, { type MenuItem } from './ContextMenu.vue'
import { useInlineRename } from '../composables/useInlineRename'

const props = defineProps<{
  folderId: string
  name: string
  x: number
  y: number
  cellSize: number
  hovered: boolean
}>()

const emit = defineEmits<{
  dragEnd: [id: string, x: number, y: number]
  open: [id: string]
  delete: [id: string]
  rename: [id: string, name: string]
}>()

const dragging = ref(false)
const contextMenu = ref<{ x: number; y: number } | null>(null)
const dragX = ref(0)
const dragY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
let startX = 0
let startY = 0
let moved = false

// 重命名
const {
  renamingId: editing,
  inputRef: editInputRef,
  startRename,
  finishRename: _finishRename,
  onKeydown: _onRenameKeydown,
} = useInlineRename({
  onComplete: (id, newName) => emit('rename', id, newName),
})

function finishRename() {
  _finishRename(() => props.name) // 单项场景，忽略 id
}

function onRenameKeydown(e: KeyboardEvent) {
  _onRenameKeydown(e, () => props.name)
}

const posX = computed(() => (dragging.value ? dragX.value : props.x))
const posY = computed(() => (dragging.value ? dragY.value : props.y))

const menuItems: MenuItem[] = [
  { id: 'open', label: '打开', icon: FolderOpen },
  { id: 'rename', label: '重命名', icon: Pencil },
  { id: 'divider', label: '', divider: true },
  { id: 'delete', label: '删除', icon: Trash2, danger: true },
]

// ── Drag ──

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || editing.value) return
  contextMenu.value = null
  startX = e.clientX
  startY = e.clientY
  dragOffsetX.value = e.clientX - props.x
  dragOffsetY.value = e.clientY - props.y
  moved = false

  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return

  if (!moved) {
    moved = true
    dragging.value = true
  }

  dragX.value = e.clientX - dragOffsetX.value
  dragY.value = e.clientY - dragOffsetY.value
}

function onPointerUp() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)

  if (dragging.value) {
    dragging.value = false
    emit('dragEnd', props.folderId, dragX.value, dragY.value)
  }
}

// ── Double-click ──

function onDblClick() {
  if (!moved && !editing.value) {
    emit('open', props.folderId)
  }
}

// ── Context menu ──

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  contextMenu.value = { x: e.clientX, y: e.clientY }
}

function onMenuSelect(menuId: string) {
  contextMenu.value = null
  if (menuId === 'open') emit('open', props.folderId)
  if (menuId === 'rename') startRename(props.folderId)
  if (menuId === 'delete') emit('delete', props.folderId)
}

// ── Inline rename（逻辑已提取到 useInlineRename composable）──
</script>

<template>
  <div
    class="folder-icon"
    :class="{ dragging, hovered }"
    :data-folder-id="folderId"
    :style="{ left: `${posX}px`, top: `${posY}px`, width: `${cellSize}px` }"
    @pointerdown="onPointerDown"
    @dblclick="onDblClick"
    @contextmenu="onContextMenu"
  >
    <div class="icon-wrapper">
      <div class="icon-box">
        <div class="icon-gloss" />
        <Folder v-if="!hovered" class="icon-svg" />
        <FolderOpen v-else class="icon-svg icon-svg-open" />
      </div>
    </div>

    <!-- 可编辑标签 -->
    <span
      v-if="!editing"
      class="icon-label"
      @dblclick.stop="startRename(props.folderId)"
    >{{ name }}</span>
    <span
      v-else
      ref="editInputRef"
      class="icon-label icon-label-edit"
      contenteditable="true"
      spellcheck="false"
      @blur="finishRename"
      @keydown="onRenameKeydown"
      @pointerdown.stop
    >{{ name }}</span>

    <ContextMenu
      v-if="contextMenu"
      :items="menuItems"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @select="onMenuSelect"
      @close="contextMenu = null"
    />
  </div>
</template>

<style scoped>
.folder-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 6px;
  border-radius: 14px;
  cursor: default;
  user-select: none;
  touch-action: none;
  transition: background 0.2s ease;
  z-index: 1;
}

.folder-icon:hover {
  background: oklch(1 0 0 / 0.08);
}

.dark .folder-icon:hover {
  background: oklch(1 0 0 / 0.05);
}

.folder-icon.dragging {
  opacity: 0.8;
  z-index: 100;
}

/* 拖放目标高亮 */
.folder-icon.hovered {
  background: oklch(0.55 0.15 240 / 0.15);
}

.folder-icon.hovered .icon-box {
  transform: scale(1.08);
}

/* ── Icon wrapper ── */
.icon-wrapper {
  position: relative;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: oklch(0.52 0.14 250);
  box-shadow:
    0 2px 6px oklch(0 0 0 / 0.1),
    0 8px 24px oklch(0 0 0 / 0.08),
    inset 0 1px 0 oklch(1 0 0 / 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.folder-icon:hover .icon-box {
  transform: translateY(-2px);
  box-shadow:
    0 4px 10px oklch(0 0 0 / 0.12),
    0 12px 32px oklch(0 0 0 / 0.1),
    inset 0 1px 0 oklch(1 0 0 / 0.3);
}

.icon-gloss {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    oklch(1 0 0 / 0.25) 0%,
    oklch(1 0 0 / 0.05) 40%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 1;
}

.icon-svg {
  width: 28px;
  height: 28px;
  color: white;
  stroke-width: 1.8;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.15));
  transition: transform 0.2s ease;
}

.icon-svg-open {
  transform: scale(1.08);
}

/* ── Label ── */
.icon-label {
  font-size: 11px;
  font-weight: 500;
  color: oklch(0.25 0 0);
  text-align: center;
  line-height: 1.3;
  max-width: 76px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 1px 4px;
  border-radius: 3px;
}

.dark .icon-label {
  color: oklch(0.9 0 0);
  text-shadow: 0 1px 3px oklch(0 0 0 / 0.6);
}

.icon-label-edit {
  outline: 2px solid oklch(0.5 0.15 250);
  background: oklch(1 0 0 / 0.9);
  white-space: pre;
  overflow: visible;
  min-width: 40px;
}

.dark .icon-label-edit {
  background: oklch(0.25 0 0 / 0.95);
  color: oklch(0.95 0 0);
}
</style>
