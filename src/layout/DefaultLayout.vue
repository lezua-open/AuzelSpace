<script setup lang="ts">
import Sidebar from './sidebar/Sidebar.vue'
</script>

<template>
  <div class="flex h-full">
    <Sidebar />
    <main class="relative flex-1 overflow-hidden">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>
