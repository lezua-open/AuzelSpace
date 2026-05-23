<script setup lang="ts">
import { computed, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useDark } from '@vueuse/core'
import { ImagePlus } from 'lucide-vue-next'
import { uploadImage } from '@/lib/api'

const props = defineProps<{
  modelValue: string
  fileName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'insert-at-cursor': [text: string]
}>()

const isDark = useDark()
const imageInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
let cmView: EditorView | null = null

function onReady(payload: { view: EditorView }) {
  cmView = payload.view
}

async function onImageSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const { url } = await uploadImage(file)
    const alt = file.name.replace(/\.[^.]+$/, '')
    const text = `![${alt}](${url})`
    if (cmView) {
      const { from } = cmView.state.selection.main
      cmView.dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length },
      })
      cmView.focus()
    } else {
      emit('insert-at-cursor', text)
    }
  } catch (err) {
    console.error('Image upload failed:', err)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

const extensions = computed(() => [
  basicSetup,
  markdown({ base: markdownLanguage }),
  EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    },
    '.cm-gutters': {
      borderRight: '1px solid var(--border)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'var(--muted-foreground)',
    },
  }),
  ...(isDark.value ? [oneDark] : []),
])

function onUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Editor header -->
    <div class="flex items-center justify-between border-b px-4 py-2.5">
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-muted-foreground">编辑</span>
        <span class="rounded bg-muted px-1.5 text-[11px] text-muted-foreground/70">
          {{ fileName || '未命名' }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          :disabled="uploading"
          @click="imageInputRef?.click()"
        >
          <ImagePlus class="size-3.5" />
          <span>{{ uploading ? '上传中...' : '图片' }}</span>
        </button>
        <input
          ref="imageInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onImageSelect"
        />
      </div>
    </div>

    <!-- Editor body -->
    <div class="flex-1 overflow-hidden">
      <Codemirror
        :model-value="modelValue"
        :extensions="extensions"
        :style="{ height: '100%' }"
        :autofocus="true"
        :tab-size="2"
        @change="onUpdate"
        @ready="onReady"
      />
    </div>
  </div>
</template>
