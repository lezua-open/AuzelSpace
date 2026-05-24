import type { Component } from 'vue'
import type { AppManifest } from '../types'

const componentCache = new Map<string, Component>()

/**
 * 应用加载器 — 根据 manifest.entry 加载组件。
 * - `local:<name>` → 从本地 ../apps/<name>/index.vue 加载
 * - 远程 URL → 通过 script tag 加载 UMD 包（Phase 2）
 */
export function useAppLoader() {
  async function loadApp(manifest: AppManifest): Promise<Component> {
    const cached = componentCache.get(manifest.id)
    if (cached) return cached

    let comp: Component

    if (manifest.entry.startsWith('local:')) {
      const localId = manifest.entry.replace('local:', '')
      const mod = await import(`../apps/${localId}/index.vue`)
      comp = mod.default ?? mod
    } else {
      comp = await loadRemote(manifest)
    }

    componentCache.set(manifest.id, comp)
    return comp
  }

  return { loadApp }
}

/** 远程 JS 包加载 — script tag + UMD 模式 */
function loadRemote(manifest: AppManifest): Promise<Component> {
  return new Promise((resolve, reject) => {
    // 暴露 Vue 全局变量供 UMD 包使用
    import('vue').then((Vue) => {
      ;(window as any).Vue = Vue
      ;(window as any).__AUZEL_APPS__ = (window as any).__AUZEL_APPS__ || {}
    })

    const script = document.createElement('script')
    script.src = manifest.entry
    script.async = true
    script.onload = () => {
      const comp = (window as any).__AUZEL_APPS__?.[manifest.id]
      if (comp) {
        resolve(comp)
      } else {
        reject(new Error(`App "${manifest.id}" did not register on window.__AUZEL_APPS__`))
      }
      script.remove()
    }
    script.onerror = () => {
      reject(new Error(`Failed to load remote app from ${manifest.entry}`))
      script.remove()
    }
    document.head.appendChild(script)
  })
}
