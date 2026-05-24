<script setup lang="ts">
import { ref, provide } from 'vue'
import Sidebar from './sidebar/Sidebar.vue'

const sidebarVisible = ref(true)
provide('sidebarVisible', sidebarVisible)
</script>

<template>
  <div class="flex h-full">
    <Transition name="sidebar">
      <Sidebar v-show="sidebarVisible" />
    </Transition>
    <main class="relative flex-1 overflow-y-hidden">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
