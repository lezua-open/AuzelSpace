<script setup lang="ts">
import { ref, onMounted, inject, type Ref } from 'vue'
import { Download, Trash2, ExternalLink, Search } from 'lucide-vue-next'
import { useAppRegistryStore } from '../../stores/appRegistry'
import type { AppManifest, DesktopAPI } from '../../types'

const registry = useAppRegistryStore()
const desktopAPI = inject<DesktopAPI>('desktopAPI')

const manifestUrl = ref('')
const installing = ref(false)
const installError = ref('')

onMounted(() => {
  desktopAPI?.setTitle('应用商店')
  registry.loadInstalled()
})

async function handleManualInstall() {
  if (!manifestUrl.value.trim()) return
  installing.value = true
  installError.value = ''

  try {
    const res = await fetch(manifestUrl.value.trim())
    const manifest: AppManifest = await res.json()

    // 基本校验
    if (!manifest.id || !manifest.name || !manifest.entry) {
      throw new Error('manifest 缺少必要字段 (id, name, entry)')
    }

    // 如果没有 icon/color，给默认值
    manifest.icon = manifest.icon || 'Box'
    manifest.color = manifest.color || 'oklch(0.65 0.15 250)'

    registry.installApp(manifest)
    manifestUrl.value = ''
  } catch (e: any) {
    installError.value = e.message ?? '安装失败'
  } finally {
    installing.value = false
  }
}

function handleUninstall(appId: string) {
  registry.uninstallApp(appId)
}
</script>

<template>
  <div class="app-store">
    <h2 class="store-title">应用商店</h2>

    <!-- 手动安装 -->
    <section class="store-section">
      <h3 class="section-title">手动安装</h3>
      <p class="section-desc">输入应用的 manifest.json 地址</p>
      <div class="install-row">
        <input
          v-model="manifestUrl"
          class="install-input"
          placeholder="https://example.com/app/manifest.json"
          @keyup.enter="handleManualInstall"
        />
        <button class="install-btn" :disabled="installing" @click="handleManualInstall">
          <Download :size="14" />
          {{ installing ? '安装中...' : '安装' }}
        </button>
      </div>
      <p v-if="installError" class="install-error">{{ installError }}</p>
    </section>

    <!-- 已安装应用 -->
    <section class="store-section">
      <h3 class="section-title">已安装</h3>
      <div v-if="registry.allApps.length === 0" class="empty-hint">暂无应用</div>
      <div class="app-list">
        <div v-for="app in registry.allApps" :key="app.id" class="app-card">
          <div class="app-info">
            <span class="app-name">{{ app.name }}</span>
            <span v-if="app.description" class="app-desc">{{ app.description }}</span>
            <span v-if="app.version" class="app-version">v{{ app.version }}</span>
          </div>
          <button
            v-if="!app.entry.startsWith('local:')"
            class="uninstall-btn"
            title="卸载"
            @click="handleUninstall(app.id)"
          >
            <Trash2 :size="14" />
          </button>
          <span v-else class="built-in-tag">内置</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.app-store {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.store-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: oklch(0.2 0 0);
}

.dark .store-title {
  color: oklch(0.9 0 0);
}

.store-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: oklch(0.3 0 0);
}

.dark .section-title {
  color: oklch(0.8 0 0);
}

.section-desc {
  font-size: 12px;
  color: oklch(0.5 0 0);
  margin-bottom: 10px;
}

.install-row {
  display: flex;
  gap: 8px;
}

.install-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid oklch(0.88 0 0);
  background: oklch(1 0 0);
  font-size: 13px;
  color: oklch(0.2 0 0);
  outline: none;
}

.install-input:focus {
  border-color: oklch(0.6 0.15 250);
}

.dark .install-input {
  background: oklch(0.2 0 0);
  border-color: oklch(0.3 0 0);
  color: oklch(0.9 0 0);
}

.install-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: oklch(0.55 0.15 250);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.install-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.install-error {
  margin-top: 6px;
  font-size: 12px;
  color: oklch(0.55 0.15 25);
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 10px;
  background: oklch(0.97 0 0);
  border: 1px solid oklch(0.92 0 0);
}

.dark .app-card {
  background: oklch(0.2 0 0);
  border-color: oklch(0.28 0 0);
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 14px;
  font-weight: 500;
  color: oklch(0.2 0 0);
}

.dark .app-name {
  color: oklch(0.9 0 0);
}

.app-desc {
  font-size: 12px;
  color: oklch(0.5 0 0);
}

.app-version {
  font-size: 11px;
  color: oklch(0.55 0 0);
}

.uninstall-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: oklch(0.5 0 0);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uninstall-btn:hover {
  background: oklch(0.9 0.1 25);
  color: oklch(0.55 0.15 25);
}

.dark .uninstall-btn:hover {
  background: oklch(0.25 0.1 25);
  color: oklch(0.65 0.15 25);
}

.built-in-tag {
  font-size: 11px;
  color: oklch(0.55 0 0);
  padding: 2px 8px;
  border-radius: 4px;
  background: oklch(0.94 0 0);
}

.dark .built-in-tag {
  background: oklch(0.25 0 0);
  color: oklch(0.6 0 0);
}

.empty-hint {
  font-size: 13px;
  color: oklch(0.5 0 0);
  text-align: center;
  padding: 20px;
}
</style>
