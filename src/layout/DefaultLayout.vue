<script setup lang="ts">
import Sidebar from './sidebar/Sidebar.vue'
</script>

<template>
  <div class="flex h-full">
    <Sidebar />
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>
  </div>
</template>
