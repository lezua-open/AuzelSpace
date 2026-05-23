<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import type { Version } from '../samples'

const props = defineProps<{
  open: boolean
  version: Version | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch {
        // fall through
      }
    }
    return escapeHtml(str)
  },
})

const renderedContent = computed(() => {
  if (!props.version?.content) return ''
  return md.render(props.version.content)
})

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="open && version"
        class="fixed inset-0 z-50 flex items-center justify-center p-8"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleClose" />

        <!-- Dialog -->
        <div class="relative z-10 flex h-full w-full max-w-4xl flex-col rounded-lg border bg-background shadow-lg">
          <!-- Header -->
          <div class="flex items-center justify-between border-b px-6 py-3">
            <div>
              <h2 class="text-lg font-semibold">{{ version.name }}</h2>
              <p class="text-xs text-muted-foreground">
                {{ formatDate(version.createdAt) }}
                <span v-if="version.published" class="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  已定稿
                </span>
              </p>
            </div>
            <button
              class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="handleClose"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Note -->
          <div v-if="version.note" class="border-b bg-muted/30 px-6 py-2 text-xs text-muted-foreground">
            {{ version.note }}
          </div>

          <!-- Preview content -->
          <div class="flex-1 overflow-y-auto">
            <div
              class="markdown-body px-6 py-5"
              v-html="renderedContent"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
