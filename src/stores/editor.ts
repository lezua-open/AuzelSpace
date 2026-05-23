import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { sampleFiles, type MarkdownFile, type Version } from '@/view/edit/samples'
import * as api from '@/lib/api'

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

  // --- Load from server ---
  async function loadFromServer() {
    try {
      const [serverFiles, serverVersions] = await Promise.all([
        api.fetchFiles(),
        // Fetch versions for all files
        api.fetchFiles().then(fs =>
          Promise.all(fs.map(f => api.fetchVersions(f.id))),
        ).then(vss => vss.flat()),
      ])

      if (serverFiles.length > 0) {
        files.value = serverFiles
        versions.value = serverVersions
      } else {
        // Seed with sample files if server is empty
        const seeded: MarkdownFile[] = []
        for (const sample of sampleFiles) {
          const created = await api.createFile(sample.name, sample.content)
          seeded.push(created)
        }
        files.value = seeded
        versions.value = []
      }
    } catch (e) {
      console.warn('Failed to load from server, falling back to samples:', e)
      files.value = [...sampleFiles]
      versions.value = []
    }
  }

  // --- Save current file content to server ---
  async function saveToServer() {
    const file = activeFile.value
    if (!file) return
    try {
      await api.updateFile(file.id, { content: file.content })
      dirty.value = false
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  // --- File actions ---
  function selectFile(index: number) {
    activeIndex.value = index
  }

  async function addFile(file: MarkdownFile) {
    try {
      const created = await api.createFile(file.name, file.content)
      files.value.push(created)
      activeIndex.value = files.value.length - 1
    } catch (e) {
      console.error('Failed to create file:', e)
    }
  }

  async function removeFile(index: number) {
    if (files.value.length <= 1) return
    const file = files.value[index]
    if (!file) return
    try {
      await api.deleteFile(file.id)
      const fileId = file.id
      files.value.splice(index, 1)
      versions.value = versions.value.filter(v => v.fileId !== fileId)
      if (activeIndex.value >= files.value.length) {
        activeIndex.value = files.value.length - 1
      } else if (activeIndex.value === index) {
        activeIndex.value = Math.max(0, index - 1)
      }
    } catch (e) {
      console.error('Failed to delete file:', e)
    }
  }

  function updateContent(content: string) {
    const file = activeFile.value
    if (file) {
      file.content = content
      dirty.value = true
    }
  }

  // --- Version actions ---
  async function createVersion(name: string, note: string, published: boolean) {
    const file = activeFile.value
    if (!file) return
    try {
      const version = await api.createVersion(file.id, name, note, published)
      versions.value.push(version)
      return version
    } catch (e) {
      console.error('Failed to create version:', e)
    }
  }

  function restoreVersion(versionId: string) {
    const version = versions.value.find(v => v.id === versionId)
    const file = activeFile.value
    if (version && file) {
      file.content = version.content
      dirty.value = true
    }
  }

  async function deleteVersion(versionId: string) {
    try {
      await api.deleteVersion(versionId)
      const index = versions.value.findIndex(v => v.id === versionId)
      if (index !== -1) versions.value.splice(index, 1)
    } catch (e) {
      console.error('Failed to delete version:', e)
    }
  }

  // --- Init ---
  loadFromServer()

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
    saveToServer,
    createVersion,
    restoreVersion,
    deleteVersion,
  }
})
