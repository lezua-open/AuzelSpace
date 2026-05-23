<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Save, Check, Upload, History, Pencil, Eye } from 'lucide-vue-next'
import { PatternBackground } from '@/components/ui/pattern-background'
import { useEditorStore } from '@/stores/editor'
import FileManager from './FileManager.vue'
import MarkdownEditor from './editor/MarkdownEditor.vue'
import MarkdownPreview from './editor/MarkdownPreview.vue'
import PublishDialog from './version/PublishDialog.vue'
import VersionPanel from './version/VersionPanel.vue'
import DiffView from './version/DiffView.vue'
import VersionPreview from './version/VersionPreview.vue'
import type { Version } from './samples'

const store = useEditorStore()

/* ── View mode: preview (default) or edit (side-by-side) ── */
const viewMode = ref<'preview' | 'edit'>('preview')

watch(() => store.activeIndex, () => {
  viewMode.value = 'preview'
})

const currentContent = computed({
  get: () => store.activeFile?.content ?? '',
  set: (val: string) => store.updateContent(val),
})

/* ── Save feedback ── */
const saved = ref(false)
let savedTimer: ReturnType<typeof setTimeout> | null = null

function handleSave() {
  store.saveToStorage()
  saved.value = true
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { saved.value = false }, 1500)
}

/* ── Publish dialog ── */
const showPublishDialog = ref(false)

function handlePublish(name: string, note: string) {
  store.createVersion(name, note, true)
  showPublishDialog.value = false
}

/* ── Version panel ── */
const showVersionPanel = ref(false)

/* ── Diff view ── */
const showDiffView = ref(false)
const diffVersion = ref<Version | null>(null)

function handleCompare(version: Version) {
  diffVersion.value = version
  showDiffView.value = true
}

const diffLeftLabel = computed(() => diffVersion.value?.name ?? '')
const diffLeftContent = computed(() => diffVersion.value?.content ?? '')
const diffRightLabel = computed(() => store.activeFile?.name ?? '当前内容')
const diffRightContent = computed(() => store.activeFile?.content ?? '')

/* ── Version preview ── */
const showVersionPreview = ref(false)
const previewVersion = ref<Version | null>(null)

function handleViewVersion(version: Version) {
  previewVersion.value = version
  showVersionPreview.value = true
}

/* ── Scroll sync between editor and preview ── */
const editorWrapperRef = ref<HTMLElement | null>(null)
const previewWrapperRef = ref<HTMLElement | null>(null)

let syncing = false
const syncCleanup: (() => void)[] = []

function getScrollPercent(el: HTMLElement): number {
  const range = el.scrollHeight - el.clientHeight
  return range > 0 ? el.scrollTop / range : 0
}

function setScrollPercent(el: HTMLElement, percent: number) {
  el.scrollTop = percent * (el.scrollHeight - el.clientHeight)
}

function setupScrollSync(editorScroll: HTMLElement, previewScroll: HTMLElement) {
  const onEditorScroll = () => {
    if (syncing) return
    syncing = true
    setScrollPercent(previewScroll, getScrollPercent(editorScroll))
    syncing = false
  }

  const onPreviewScroll = () => {
    if (syncing) return
    syncing = true
    setScrollPercent(editorScroll, getScrollPercent(previewScroll))
    syncing = false
  }

  editorScroll.addEventListener('scroll', onEditorScroll, { passive: true })
  previewScroll.addEventListener('scroll', onPreviewScroll, { passive: true })

  syncCleanup.push(
    () => editorScroll.removeEventListener('scroll', onEditorScroll),
    () => previewScroll.removeEventListener('scroll', onPreviewScroll),
  )
}

/* ── Resizable split ── */
const splitRatio = ref(50) // editor percentage (10-90)
const dragging = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function onDividerMouseDown(e: MouseEvent) {
  e.preventDefault()
  dragging.value = true
  document.addEventListener('mousemove', onDividerMouseMove)
  document.addEventListener('mouseup', onDividerMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onDividerMouseMove(e: MouseEvent) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const ratio = ((e.clientX - rect.left) / rect.width) * 100
  splitRatio.value = Math.min(90, Math.max(10, ratio))
}

function onDividerMouseUp() {
  dragging.value = false
  document.removeEventListener('mousemove', onDividerMouseMove)
  document.removeEventListener('mouseup', onDividerMouseUp)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  const timer = setInterval(() => {
    const editorScroll = editorWrapperRef.value?.querySelector('.cm-scroller') as HTMLElement | null
    const previewBody = previewWrapperRef.value?.querySelector('.markdown-body') as HTMLElement | null
    const previewScroll = previewBody?.parentElement as HTMLElement | null

    if (editorScroll && previewScroll) {
      clearInterval(timer)
      setupScrollSync(editorScroll, previewScroll)
    }
  }, 100)

  setTimeout(() => clearInterval(timer), 15000)
})

onUnmounted(() => {
  syncCleanup.forEach((fn) => fn())
  if (savedTimer) clearTimeout(savedTimer)
  document.removeEventListener('mousemove', onDividerMouseMove)
  document.removeEventListener('mouseup', onDividerMouseUp)
})
</script>

<template>
  <div class="relative flex h-full overflow-hidden rounded-lg">
    <!-- Decorative background -->
    <div class="absolute inset-0 z-0 opacity-[0.12]">
      <PatternBackground
        class="size-full"
        variant="dot"
        size="xl"
      />
    </div>

    <!-- Content -->
    <div class="relative z-10 flex h-full w-full">
      <!-- File Manager -->
      <FileManager
        :files="store.files"
        :active-index="store.activeIndex"
        @select-file="store.selectFile"
        @add-file="(f) => store.addFile({ ...f, id: '' })"
        @remove-file="store.removeFile"
      />

      <!-- Editor + Preview area -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Toolbar -->
        <div class="flex items-center justify-between border-b bg-muted/20 px-4 py-2">
          <div class="flex items-center gap-2">
            <span class="rounded bg-muted px-1.5 text-[11px] text-muted-foreground/70">
              {{ store.activeFile?.name || '未命名' }}
            </span>
            <span
              v-if="store.latestPublishedVersion"
              class="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
            >
              已定稿: {{ store.latestPublishedVersion.name }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <!-- Edit / Preview toggle -->
            <button
              v-if="viewMode === 'preview'"
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="viewMode = 'edit'"
            >
              <Pencil class="size-3.5" />
              <span>编辑</span>
            </button>
            <button
              v-else
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="viewMode = 'preview'"
            >
              <Eye class="size-3.5" />
              <span>预览</span>
            </button>

            <!-- Save button -->
            <button
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors"
              :class="
                store.dirty
                  ? 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              "
              @click="handleSave"
            >
              <Check v-if="saved" class="size-3.5 text-green-500" />
              <Save v-else class="size-3.5" />
              <span>{{ saved ? '已保存' : store.dirty ? '保存*' : '保存' }}</span>
            </button>

            <!-- Publish button -->
            <button
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              @click="showPublishDialog = true"
            >
              <Upload class="size-3.5" />
              <span>定稿</span>
            </button>

            <!-- Version history toggle -->
            <button
              class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors"
              :class="
                showVersionPanel
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              "
              @click="showVersionPanel = !showVersionPanel"
            >
              <History class="size-3.5" />
              <span>版本</span>
              <span
                v-if="store.activeFileVersions.length"
                class="ml-0.5 rounded-full bg-muted px-1.5 text-[10px]"
              >
                {{ store.activeFileVersions.length }}
              </span>
            </button>
          </div>
        </div>

        <!-- Preview only (default) -->
        <div v-if="viewMode === 'preview'" ref="previewWrapperRef" class="flex flex-1 overflow-hidden">
          <Transition name="fade-slide" mode="out-in">
            <MarkdownPreview
              :key="store.activeFile?.name ?? 'empty'"
              :content="currentContent"
            />
          </Transition>
        </div>

        <!-- Editor + Preview side-by-side (edit mode) -->
        <div v-else ref="containerRef" class="flex flex-1 overflow-hidden">
          <!-- Editor -->
          <div ref="editorWrapperRef" class="flex overflow-hidden" :style="{ flex: `0 0 ${splitRatio}%` }">
            <Transition name="fade-slide" mode="out-in">
              <MarkdownEditor
                :key="store.activeFile?.name ?? 'empty'"
                v-model="currentContent"
                :file-name="store.activeFile?.name ?? ''"
              />
            </Transition>
          </div>

          <!-- Divider -->
          <div
            class="group relative z-10 w-[6px] shrink-0 cursor-col-resize transition-colors"
            @mousedown="onDividerMouseDown"
          >
            <!-- Wider hit area -->
            <div class="absolute inset-y-0 -left-2 -right-2" />
            <!-- Visual line -->
            <div class="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-border transition-colors group-hover:bg-primary/70" :class="{ 'bg-primary/70': dragging }" />
            <!-- Grip dots -->
            <div class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1.5 transition-opacity group-hover:opacity-100" :class="{ 'opacity-100': dragging }" :style="{ opacity: dragging ? 1 : undefined }">
              <div class="size-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary/70" :class="{ 'bg-primary/70': dragging }" />
              <div class="size-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary/70" :class="{ 'bg-primary/70': dragging }" />
              <div class="size-1 rounded-full bg-muted-foreground/40 group-hover:bg-primary/70" :class="{ 'bg-primary/70': dragging }" />
            </div>
          </div>

          <!-- Preview -->
          <div ref="previewWrapperRef" class="flex overflow-hidden" :style="{ flex: `0 0 ${100 - splitRatio}%` }">
            <Transition name="fade-slide" mode="out-in">
              <MarkdownPreview
                :key="store.activeFile?.name ?? 'empty'"
                :content="currentContent"
              />
            </Transition>
          </div>
        </div>
      </div>

      <!-- Version Panel overlay -->
      <Transition name="slide-panel">
        <VersionPanel
          v-if="showVersionPanel"
          @close="showVersionPanel = false"
          @compare="handleCompare"
          @view="handleViewVersion"
        />
      </Transition>
    </div>

    <!-- Publish Dialog -->
    <PublishDialog
      v-model:open="showPublishDialog"
      @submit="handlePublish"
    />

    <!-- Diff View -->
    <DiffView
      v-model:open="showDiffView"
      :left-label="diffLeftLabel"
      :left-content="diffLeftContent"
      :right-label="diffRightLabel"
      :right-content="diffRightContent"
    />

    <!-- Version Preview -->
    <VersionPreview
      v-model:open="showVersionPreview"
      :version="previewVersion"
    />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
