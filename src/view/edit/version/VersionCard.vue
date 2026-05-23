<script setup lang="ts">
import { RotateCcw, GitCompare, Trash2, Eye } from 'lucide-vue-next'
import type { Version } from '../samples'

const props = defineProps<{
  version: Version
}>()

const emit = defineEmits<{
  restore: [id: string]
  compare: [version: Version]
  delete: [id: string]
  view: [version: Version]
}>()

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div class="group rounded-lg border p-3 transition-colors hover:bg-accent/30">
    <!-- Header -->
    <div class="mb-1 flex items-center justify-between">
      <span class="text-sm font-medium">{{ version.name }}</span>
      <span
        v-if="version.published"
        class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
      >
        已定稿
      </span>
    </div>

    <!-- Timestamp -->
    <p class="mb-1 text-[11px] text-muted-foreground">
      {{ formatDate(version.createdAt) }}
    </p>

    <!-- Note -->
    <p
      v-if="version.note"
      class="mb-2 line-clamp-2 text-xs text-muted-foreground/80"
    >
      {{ version.note }}
    </p>

    <!-- Actions -->
    <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="查看"
        @click="emit('view', version)"
      >
        <Eye class="size-3" />
        查看
      </button>
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="恢复"
        @click="emit('restore', version.id)"
      >
        <RotateCcw class="size-3" />
        恢复
      </button>
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="对比"
        @click="emit('compare', version)"
      >
        <GitCompare class="size-3" />
        对比
      </button>
      <button
        class="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-destructive transition-colors hover:bg-destructive/10"
        title="删除"
        @click="emit('delete', version.id)"
      >
        <Trash2 class="size-3" />
      </button>
    </div>
  </div>
</template>
