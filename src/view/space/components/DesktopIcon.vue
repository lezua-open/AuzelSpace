<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { FolderOpen, Pencil, Trash2 } from 'lucide-vue-next'
import ContextMenu, { type MenuItem } from './ContextMenu.vue'

const props = defineProps<{
  id: string
  name: string
  icon: Component
  color: string
  x: number
  y: number
  cellSize: number
}>()

const emit = defineEmits<{
  dragEnd: [id: string, x: number, y: number]
  open: [id: string]
  delete: [id: string]
}>()

const selected = ref(false)
const dragging = ref(false)
const bouncing = ref(false)
const contextMenu = ref<{ x: number; y: number } | null>(null)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const dragX = ref(0)
const dragY = ref(0)
let startX = 0
let startY = 0
let moved = false

const posX = computed(() => dragging.value ? dragX.value : props.x)
const posY = computed(() => dragging.value ? dragY.value : props.y)

const menuItems: MenuItem[] = [
  { id: 'open', label: '打开', icon: FolderOpen },
  { id: 'rename', label: '重命名', icon: Pencil },
  { id: 'divider', label: '', divider: true },
  { id: 'delete', label: '删除', icon: Trash2, danger: true },
]

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  selected.value = true
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
    emit('dragEnd', props.id, dragX.value, dragY.value)
  }
}

function onDblClick() {
  if (!moved) {
    bouncing.value = true
    setTimeout(() => {
      bouncing.value = false
      emit('open', props.id)
    }, 350)
  }
}

function onContextMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  selected.value = true
  contextMenu.value = { x: e.clientX, y: e.clientY }
}

function onMenuSelect(menuId: string) {
  contextMenu.value = null
  if (menuId === 'open') emit('open', props.id)
  if (menuId === 'delete') emit('delete', props.id)
}
</script>

<template>
  <div
    class="desktop-icon"
    :class="{ selected, dragging, bouncing }"
    :style="{ left: `${posX}px`, top: `${posY}px`, width: `${cellSize}px` }"
    @pointerdown="onPointerDown"
    @dblclick="onDblClick"
    @click.stop="selected = true"
    @contextmenu="onContextMenu"
  >
    <div class="icon-wrapper">
      <div class="icon-box" :style="{ background: color }">
        <div class="icon-gloss" />
        <component :is="icon" class="icon-svg" />
      </div>
    </div>
    <span class="icon-label">{{ name }}</span>

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
.desktop-icon {
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

.desktop-icon:hover {
  background: oklch(1 0 0 / 0.08);
}

.dark .desktop-icon:hover {
  background: oklch(1 0 0 / 0.05);
}

.desktop-icon.selected {
  background: oklch(1 0 0 / 0.1);
}

.dark .desktop-icon.selected {
  background: oklch(1 0 0 / 0.06);
}

.desktop-icon.dragging {
  opacity: 0.8;
  z-index: 100;
}

/* ── Bounce animation ── */
.desktop-icon.bouncing .icon-wrapper {
  animation: icon-bounce 0.35s cubic-bezier(0.36, 1.4, 0.5, 0.8);
}

@keyframes icon-bounce {
  0% { transform: scale(1); }
  30% { transform: scale(0.82); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* ── Icon wrapper ── */
.icon-wrapper {
  position: relative;
  will-change: transform;
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
  box-shadow: 0 2px 6px oklch(0 0 0 / 0.1),
              0 8px 24px oklch(0 0 0 / 0.08),
              inset 0 1px 0 oklch(1 0 0 / 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.desktop-icon:hover .icon-box {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px oklch(0 0 0 / 0.12),
              0 12px 32px oklch(0 0 0 / 0.1),
              inset 0 1px 0 oklch(1 0 0 / 0.3);
}

/* ── iOS gloss overlay ── */
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
  width: 26px;
  height: 26px;
  color: white;
  stroke-width: 2;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 1px 2px oklch(0 0 0 / 0.15));
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
}

.dark .icon-label {
  color: oklch(0.9 0 0);
  text-shadow: 0 1px 3px oklch(0 0 0 / 0.6);
}
</style>
