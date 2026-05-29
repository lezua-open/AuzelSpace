<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, type Component } from 'vue'

export interface MenuItem {
  id: string
  label: string
  icon?: Component
  danger?: boolean
  disabled?: boolean
  divider?: boolean
}

defineProps<{
  items: MenuItem[]
  x: number
  y: number
}>()

const emit = defineEmits<{
  select: [id: string]
  close: []
}>()

const menuRef = ref<HTMLElement | null>(null)
const adjustedX = ref(0)
const adjustedY = ref(0)

function onSelect(id: string) {
  emit('select', id)
  emit('close')
}

function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(async () => {
  document.addEventListener('pointerdown', onClickOutside)
  document.addEventListener('keydown', onEscape)

  await nextTick()
  if (!menuRef.value) return
  const rect = menuRef.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  adjustedX.value = rect.right > vw ? vw - rect.width - 8 : rect.left
  adjustedY.value = rect.bottom > vh ? vh - rect.height - 8 : rect.top
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onClickOutside)
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="menuRef"
      class="context-menu"
      :style="{ left: `${adjustedX || x}px`, top: `${adjustedY || y}px` }"
    >
      <template v-for="item in items" :key="item.id">
        <div v-if="item.divider" class="menu-divider" />
        <button
          v-else
          class="menu-item"
          :class="{ danger: item.danger, disabled: item.disabled }"
          :disabled="item.disabled"
          @click="onSelect(item.id)"
        >
          <component v-if="item.icon" :is="item.icon" class="menu-icon" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 1000;
  min-width: 160px;
  padding: 4px;
  border-radius: 10px;
  background: oklch(1 0 0 / 0.7);
  backdrop-filter: blur(24px) saturate(1.5);
  border: 1px solid oklch(1 0 0 / 0.25);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.12),
              0 2px 8px oklch(0 0 0 / 0.06);
  animation: menu-in 0.15s ease-out;
}

.dark .context-menu {
  background: oklch(0.2 0 0 / 0.75);
  border-color: oklch(1 0 0 / 0.08);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.3),
              0 2px 8px oklch(0 0 0 / 0.15);
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: oklch(0.2 0 0);
  cursor: pointer;
  transition: background 0.12s ease;
  text-align: left;
}

.dark .menu-item {
  color: oklch(0.85 0 0);
}

.menu-item:hover {
  background: oklch(0.65 0.15 250 / 0.12);
}

.dark .menu-item:hover {
  background: oklch(0.65 0.15 250 / 0.18);
}

.menu-item.danger {
  color: oklch(0.55 0.2 25);
}

.dark .menu-item.danger {
  color: oklch(0.7 0.18 25);
}

.menu-item.danger:hover {
  background: oklch(0.55 0.2 25 / 0.1);
}

.dark .menu-item.danger:hover {
  background: oklch(0.55 0.2 25 / 0.15);
}

.menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.menu-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  opacity: 0.7;
}

.menu-divider {
  height: 1px;
  margin: 4px 6px;
  background: oklch(0 0 0 / 0.08);
}

.dark .menu-divider {
  background: oklch(1 0 0 / 0.08);
}
</style>
