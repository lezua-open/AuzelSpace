import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { sampleFiles, type MarkdownFile, type Version } from '@/view/edit/samples'

const FILES_KEY = 'auzel-files'
const VERSIONS_KEY = 'auzel-versions'

export const useEditorStore = defineStore('editor', () => {
  const files = ref<MarkdownFile[]>([])
  const versions = ref<Version[]>([])
  const activeIndex = ref(0)
  const dirty = ref(false)

  // --- Computed ---
  const activeFile = computed(() => files.value[activeIndex.value] ?? null)

  const activeFileVersions = computed(() =>
    versions.value
      .filter(v => v.fileId === activeFile.value?.id)
      .sort((a, b) => b.createdAt - a.createdAt),
  )

  const latestPublishedVersion = computed(() =>
    activeFileVersions.value.find(v => v.published),
  )

  // --- Persistence ---
  function loadFromStorage() {
    try {
      const storedFiles = localStorage.getItem(FILES_KEY)
      const storedVersions = localStorage.getItem(VERSIONS_KEY)

      if (storedFiles) {
        const parsed = JSON.parse(storedFiles) as MarkdownFile[]
        files.value = parsed.map(f => ({
          ...f,
          id: f.id || crypto.randomUUID(),
        }))
      } else {
        files.value = [...sampleFiles]
      }

      if (storedVersions) {
        versions.value = JSON.parse(storedVersions)
      }
    } catch {
      files.value = [...sampleFiles]
      versions.value = []
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(files.value))
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions.value))
      dirty.value = false
    } catch (e) {
      console.warn('localStorage save failed:', e)
    }
  }

  // --- File actions ---
  function selectFile(index: number) {
    activeIndex.value = index
  }

  function addFile(file: MarkdownFile) {
    files.value.push({
      ...file,
      id: file.id || crypto.randomUUID(),
    })
    activeIndex.value = files.value.length - 1
    saveToStorage()
  }

  function removeFile(index: number) {
    if (files.value.length <= 1) return
    const file = files.value[index]
    if (!file) return
    const fileId = file.id
    files.value.splice(index, 1)
    versions.value = versions.value.filter(v => v.fileId !== fileId)
    if (activeIndex.value >= files.value.length) {
      activeIndex.value = files.value.length - 1
    } else if (activeIndex.value === index) {
      activeIndex.value = Math.max(0, index - 1)
    }
    saveToStorage()
  }

  function updateContent(content: string) {
    const file = activeFile.value
    if (file) {
      file.content = content
      dirty.value = true
    }
  }

  // --- Version actions ---
  function createVersion(name: string, note: string, published: boolean) {
    const file = activeFile.value
    if (!file) return

    const version: Version = {
      id: crypto.randomUUID(),
      fileId: file.id,
      name,
      note,
      content: file.content,
      published,
      createdAt: Date.now(),
    }
    versions.value.push(version)
    saveToStorage()
    return version
  }

  function restoreVersion(versionId: string) {
    const version = versions.value.find(v => v.id === versionId)
    const file = activeFile.value
    if (version && file) {
      file.content = version.content
      dirty.value = true
    }
  }

  function deleteVersion(versionId: string) {
    const index = versions.value.findIndex(v => v.id === versionId)
    if (index !== -1) {
      versions.value.splice(index, 1)
      saveToStorage()
    }
  }

  // --- Init ---
  loadFromStorage()

  return {
    files,
    versions,
    activeIndex,
    dirty,
    activeFile,
    activeFileVersions,
    latestPublishedVersion,
    selectFile,
    addFile,
    removeFile,
    updateContent,
    saveToStorage,
    createVersion,
    restoreVersion,
    deleteVersion,
  }
})
