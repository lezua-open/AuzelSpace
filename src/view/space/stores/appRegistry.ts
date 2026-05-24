import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppManifest } from '../types'

const STORAGE_KEY = 'auzel-app-registry'

/** 内置应用 */
const builtInApps: AppManifest[] = [
  {
    id: 'edit',
    name: '编辑器',
    icon: 'Pencil',
    color: 'oklch(0.65 0.15 250)',
    entry: 'local:edit',
    description: 'Markdown 编辑器',
  },
  {
    id: '__appstore',
    name: '应用商店',
    icon: 'Store',
    color: 'oklch(0.65 0.18 145)',
    entry: 'local:appstore',
    description: '浏览和安装应用',
  },
]

export const useAppRegistryStore = defineStore('appRegistry', () => {
  const installedApps = ref<AppManifest[]>([])
  const catalog = ref<AppManifest[]>([])

  const allApps = computed(() => [...builtInApps, ...installedApps.value])

  function loadInstalled() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) installedApps.value = JSON.parse(raw)
    } catch {
      installedApps.value = []
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(installedApps.value))
  }

  function installApp(manifest: AppManifest) {
    if (isInstalled(manifest.id)) return
    installedApps.value.push(manifest)
    save()
  }

  function uninstallApp(appId: string) {
    // 不允许卸载内置应用
    if (builtInApps.some((a) => a.id === appId)) return
    installedApps.value = installedApps.value.filter((a) => a.id !== appId)
    save()
  }

  function isInstalled(appId: string): boolean {
    return builtInApps.some((a) => a.id === appId) || installedApps.value.some((a) => a.id === appId)
  }

  function getApp(appId: string): AppManifest | undefined {
    return allApps.value.find((a) => a.id === appId)
  }

  async function fetchCatalog(url: string) {
    try {
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data.apps)) {
        catalog.value = data.apps as AppManifest[]
      }
    } catch (e) {
      console.error('Failed to fetch catalog:', e)
    }
  }

  return {
    installedApps,
    catalog,
    allApps,
    loadInstalled,
    installApp,
    uninstallApp,
    isInstalled,
    getApp,
    fetchCatalog,
  }
})
