<script setup lang="ts">
import { X, Plus } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/editor'
import VersionCard from './VersionCard.vue'
import type { Version } from '../samples'

const store = useEditorStore()

const emit = defineEmits<{
  close: []
  compare: [version: Version]
  view: [version: Version]
}>()

function handleRestore(id: string) {
  store.restoreVersion(id)
}

function handleDelete(id: string) {
  store.deleteVersion(id)
}

function handleView(version: Version) {
  emit('view', version)
}

function handleCompare(version: Version) {
  emit('compare', version)
}
</script>

<template>
  <div class="flex w-[320px] shrink-0 flex-col border-l bg-background/95 backdrop-blur-sm">
    <!-- Header -->
    <div class="flex items-center justify-between border-b px-4 py-2.5">
      <span class="text-xs font-medium text-muted-foreground">版本历史</span>
      <button
        class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="emit('close')"
      >
        <X class="size-4" />
      </button>
    </div>

    <!-- Version list -->
    <div class="flex-1 overflow-y-auto p-3 space-y-2">
      <template v-if="store.activeFileVersions.length">
        <VersionCard
          v-for="version in store.activeFileVersions"
          :key="version.id"
          :version="version"
          @restore="handleRestore"
          @delete="handleDelete"
          @view="handleView"
          @compare="handleCompare"
        />
      </template>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center gap-2 py-12 text-center text-xs text-muted-foreground"
      >
        <p>暂无版本记录</p>
        <p class="text-muted-foreground/60">点击「定稿」创建第一个版本</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-3">
      <button
        class="flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors hover:bg-accent"
        @click="store.createVersion('快照', '', false)"
      >
        <Plus class="size-3.5" />
        创建版本快照
      </button>
    </div>
  </div>
</template>
