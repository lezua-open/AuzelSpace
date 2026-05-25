<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Settings, Palette } from 'lucide-vue-next'

const time = ref('')
let timer: ReturnType<typeof setInterval>

function updateTime() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 30000)
})

onUnmounted(() => clearInterval(timer))

const emit = defineEmits<{
  action: [actionId: string]
}>()
</script>

<template>
  <div class="topbar">
    <div class="topbar-spacer" />
    <div class="topbar-actions">
      <button class="topbar-btn" title="设置" @click="emit('action', 'settings')">
        <Settings class="topbar-icon" />
      </button>
      <button class="topbar-btn" title="主题色调" @click="emit('action', 'toggle-palette')">
        <Palette class="topbar-icon" />
      </button>
      <span class="topbar-sep" />
      <button class="topbar-time-btn" title="时钟" @click="emit('action', 'toggle-clock')">{{ time }}</button>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  background: oklch(1 0 0 / 0.65);
  backdrop-filter: blur(24px) saturate(1.8);
  border-bottom: 1px solid oklch(0 0 0 / 0.08);
  box-shadow: 0 1px 8px oklch(0 0 0 / 0.06);
}

.dark .topbar {
  background: oklch(0.22 0 0 / 0.7);
  border-bottom-color: oklch(1 0 0 / 0.06);
  box-shadow: 0 1px 8px oklch(0 0 0 / 0.2);
}

.topbar-spacer {
  flex: 1;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.topbar-sep {
  width: 1px;
  height: 14px;
  background: oklch(0 0 0 / 0.12);
}

.dark .topbar-sep {
  background: oklch(1 0 0 / 0.1);
}

.topbar-time-btn {
  font-size: 11.5px;
  font-weight: 500;
  color: oklch(0.3 0 0);
  font-variant-numeric: tabular-nums;
  padding: 2px 6px;
  border: none;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease;
}

.topbar-time-btn:hover {
  background: oklch(0 0 0 / 0.06);
}

.dark .topbar-time-btn {
  color: oklch(0.8 0 0);
}

.dark .topbar-time-btn:hover {
  background: oklch(1 0 0 / 0.06);
}

.topbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: oklch(0.35 0 0);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.topbar-btn:hover {
  background: oklch(0 0 0 / 0.06);
  color: oklch(0.15 0 0);
}

.dark .topbar-btn {
  color: oklch(0.65 0 0);
}

.dark .topbar-btn:hover {
  background: oklch(1 0 0 / 0.06);
  color: oklch(0.9 0 0);
}

.topbar-icon {
  width: 14px;
  height: 14px;
}
</style>
