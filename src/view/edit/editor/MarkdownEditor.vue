<script setup lang="ts">
import { computed } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useDark } from '@vueuse/core'

const props = defineProps<{
  modelValue: string
  fileName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isDark = useDark()

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
      />
    </div>
  </div>
</template>
