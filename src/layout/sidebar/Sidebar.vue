<script setup lang="ts">
import { ref } from 'vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarThemeToggle from './SidebarThemeToggle.vue'

const collapsed = ref(false)
</script>

<template>
  <aside class="flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-60'">
    <SidebarLogo :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <SidebarNav :collapsed="collapsed" />
    <SidebarThemeToggle :collapsed="collapsed" />
  </aside>
</template>
