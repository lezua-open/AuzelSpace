<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import { MergeView } from '@codemirror/merge'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { useDark } from '@vueuse/core'

const props = defineProps<{
  open: boolean
  leftLabel: string
  leftContent: string
  rightLabel: string
  rightContent: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isDark = useDark()
const containerRef = ref<HTMLElement | null>(null)
let mergeView: MergeView | null = null

function makeExtensions() {
  const ext = [
    basicSetup,
    markdown({ base: markdownLanguage }),
    EditorState.readOnly.of(true),
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      },
    }),
  ]
  if (isDark.value) {
    ext.push(oneDark)
  }
  return ext
}

function createMergeView() {
  if (!containerRef.value) return
  if (mergeView) {
    mergeView.destroy()
    mergeView = null
  }

  mergeView = new MergeView({
    parent: containerRef.value,
    a: {
      doc: props.leftContent,
      extensions: makeExtensions(),
    },
    b: {
      doc: props.rightContent,
      extensions: makeExtensions(),
    },
    highlightChanges: true,
    gutter: true,
  })
}

function handleClose() {
  emit('update:open', false)
}

watch(() => props.open, async (val) => {
  if (val) {
    await nextTick()
    createMergeView()
  } else {
    if (mergeView) {
      mergeView.destroy()
      mergeView = null
    }
  }
})

onUnmounted(() => {
  if (mergeView) {
    mergeView.destroy()
    mergeView = null
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-8"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleClose" />

        <!-- Dialog -->
        <div class="relative z-10 flex h-full w-full max-w-6xl flex-col rounded-lg border bg-background shadow-lg">
          <!-- Header -->
          <div class="flex items-center justify-between border-b px-6 py-3">
            <h2 class="text-lg font-semibold">版本对比</h2>
            <button
              class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="handleClose"
            >
              <X class="size-4" />
            </button>
          </div>

          <!-- Labels -->
          <div class="flex border-b">
            <div class="flex-1 px-6 py-2 text-xs text-muted-foreground">
              {{ leftLabel }}
            </div>
            <div class="flex-1 border-l px-6 py-2 text-xs text-muted-foreground">
              {{ rightLabel }}
            </div>
          </div>

          <!-- Diff container -->
          <div ref="containerRef" class="flex-1 overflow-hidden" />
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

:deep(.cm-mergeView) {
  height: 100%;
}

:deep(.cm-mergeView .cm-editor) {
  height: 100%;
}

:deep(.cm-mergeView .cm-scroller) {
  overflow: auto;
}
</style>
