<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Upload, Trash2, Plus } from 'lucide-vue-next'
import type { MarkdownFile } from './samples'

const props = defineProps<{
  files: MarkdownFile[]
  activeIndex: number
}>()

const emit = defineEmits<{
  'select-file': [index: number]
  'add-file': [file: { name: string; content: string }]
  'remove-file': [index: number]
}>()

const fileInput = ref<HTMLInputElement>()

function handleSelect(index: number) {
  emit('select-file', index)
}

function handleUpload() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    emit('add-file', { name: file.name, content })
  }
  reader.readAsText(file)
  input.value = '' // Reset so same file can be uploaded again
}

function handleRemove(index: number, event: MouseEvent) {
  event.stopPropagation()
  emit('remove-file', index)
}
</script>

<template>
  <div
    class="flex w-[200px] shrink-0 flex-col border-r bg-muted/30"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b px-3 py-2.5">
      <span class="text-xs font-medium text-muted-foreground">文件</span>
      <button
        class="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="上传 Markdown 文件"
        @click="handleUpload"
      >
        <Plus class="size-3.5" />
      </button>
    </div>

    <!-- File list -->
    <div class="flex-1 overflow-y-auto p-2">
      <div
        v-for="(file, index) in files"
        :key="file.name"
        class="group relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors"
        :class="
          index === activeIndex
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
        "
        @click="handleSelect(index)"
      >
        <FileText class="size-4 shrink-0" />
        <span class="flex-1 truncate">{{ file.name }}</span>
        <button
          v-if="files.length > 1"
          class="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-background/50 group-hover:opacity-100"
          title="删除文件"
          @click="handleRemove(index, $event)"
        >
          <Trash2 class="size-3.5 text-destructive" />
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="files.length === 0"
        class="flex flex-col items-center gap-2 py-8 text-center text-xs text-muted-foreground"
      >
        <FileText class="size-8 opacity-30" />
        <span>暂无文件</span>
        <button
          class="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
          @click="handleUpload"
        >
          <Upload class="size-3" />
          上传文件
        </button>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".md,.markdown,.mdown"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
