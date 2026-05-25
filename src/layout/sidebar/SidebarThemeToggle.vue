<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

defineProps<{
  collapsed: boolean
}>()

const isDark = useDark()
const toggleDark = useToggle(isDark)

function toggleTheme(e: MouseEvent) {
  if (!document.startViewTransition) {
    toggleDark()
    return
  }
  const html = document.documentElement
  html.style.setProperty('--tx', `${e.clientX}px`)
  html.style.setProperty('--ty', `${e.clientY}px`)
  document.startViewTransition(() => {
    toggleDark()
  })
}
</script>

<template>
  <div class="border-t border-sidebar-border px-3 py-3">
    <button class="theme-toggle" :class="{ dark: isDark }" :title="isDark ? '切换亮色' : '切换暗色'" @click="toggleTheme">
      <span class="track">
        <span class="thumb">
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg class="moon" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21.64 13.36A9 9 0 0 1 12.36.36 7 7 0 1 0 21.64 13.36z" />
          </svg>
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 4px 0;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.track {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: oklch(0.88 0.01 80);
  transition: background 0.6s ease;
  overflow: hidden;
  box-shadow: inset 0 1px 3px oklch(0 0 0 / 0.08);
}

.dark .track {
  background: oklch(0.22 0.02 260);
}

.thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.5s ease,
    box-shadow 0.5s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.08);
  view-transition-name: theme-toggle-thumb;
}

.dark .thumb {
  transform: translateX(22px);
  background: oklch(0.32 0.03 260);
  box-shadow: 0 1px 2px oklch(0 0 0 / 0.2);
}

/* ── Icons ── */
.sun,
.moon {
  position: absolute;
  width: 12px;
  height: 12px;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.35s ease;
}

.sun {
  color: oklch(0.62 0.16 85);
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.dark .sun {
  opacity: 0;
  transform: rotate(90deg) scale(0);
}

.moon {
  color: oklch(0.85 0.04 260);
  opacity: 0;
  transform: rotate(-90deg) scale(0);
}

.dark .moon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

/* ── Hover ── */
.theme-toggle:hover .thumb {
  box-shadow: 0 0 0 4px oklch(0.62 0.16 85 / 0.1);
}

.dark .theme-toggle:hover .thumb {
  box-shadow: 0 0 0 4px oklch(0.7 0.04 260 / 0.12);
}

/* ── Active ── */
.theme-toggle:active .thumb {
  width: 24px;
  transition: width 0.15s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s ease;
}

.dark .theme-toggle:active .thumb {
  transform: translateX(18px);
}
</style>
