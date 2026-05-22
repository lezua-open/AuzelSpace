<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <nav class="flex-1 space-y-1 px-3 py-2">
    <router-link to="/"
      class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      active-class="bg-sidebar-accent text-sidebar-accent-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span v-show="!collapsed">Home</span>
    </router-link>
  </nav>
</template>
