<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4">
    <span v-show="!collapsed" class="text-sm font-semibold text-sidebar-foreground">
      AuzelWeb
    </span>
    <button
      class="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      @click="emit('toggle')">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="collapsed">
          <path d="m9 18 6-6-6-6" />
        </template>
        <template v-else>
          <path d="m15 18-6-6 6-6" />
        </template>
      </svg>
    </button>
  </div>
</template>
