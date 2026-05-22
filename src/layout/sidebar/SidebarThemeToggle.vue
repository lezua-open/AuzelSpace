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
    <button
      class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      @click="toggleTheme"
    >
      <!-- Sun icon (shown in dark mode) -->
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <!-- Moon icon (shown in light mode) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <span v-show="!collapsed">{{ isDark ? 'Light' : 'Dark' }} Mode</span>
    </button>
  </div>
</template>
