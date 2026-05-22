# DefaultLayout 组件拆分 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 DefaultLayout.vue（97行）拆分为 5 个独立组件，放入 `layout/sidebar/` 文件夹，每个组件职责单一。

**Architecture:** 纯组件拆分，不改变任何逻辑。`DefaultLayout.vue` 变为纯布局容器；`Sidebar.vue` 持有 `collapsed` 状态并组装子组件；`SidebarLogo.vue`、`SidebarNav.vue`、`SidebarThemeToggle.vue` 通过 props 接收 `collapsed`。

**Tech Stack:** Vue 3 + TypeScript + VueUse + Tailwind CSS + View Transition API

---

### Task 1: 创建 SidebarThemeToggle.vue

**Files:**
- Create: `src/layout/sidebar/SidebarThemeToggle.vue`

- [ ] **Step 1: 创建 SidebarThemeToggle.vue**

把主题切换的 script 和按钮模板从 DefaultLayout.vue 移到这个独立文件。通过 props 接收 `collapsed`。

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

defineProps<{
  collapsed: boolean
}>()

const isDark = useDark()
const toggleDark = useToggle(isDark)

function toggleTheme(e: MouseEvent) {
  if (!document.startViewTransition) {
    toggleDark()
    return
  }
  const html = document.documentElement
  html.style.setProperty('--tx', `${e.clientX}px`)
  html.style.setProperty('--ty', `${e.clientY}px`)
  document.startViewTransition(() => {
    toggleDark()
  })
}
</script>

<template>
  <div class="border-t border-sidebar-border px-3 py-3">
    <button
      class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      @click="toggleTheme"
    >
      <!-- Sun icon (shown in dark mode) -->
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <!-- Moon icon (shown in light mode) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <span v-show="!collapsed">{{ isDark ? 'Light' : 'Dark' }} Mode</span>
    </button>
  </div>
</template>
```

- [ ] **Step 2: 验证文件创建成功**

运行类型检查确认无错误：

```bash
npx vue-tsc --noEmit src/layout/sidebar/SidebarThemeToggle.vue
```

Expected: no errors related to the new file.

---

### Task 2: 创建 SidebarNav.vue

**Files:**
- Create: `src/layout/sidebar/SidebarNav.vue`

- [ ] **Step 1: 创建 SidebarNav.vue**

```vue
<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <nav class="flex-1 space-y-1 px-3 py-2">
    <router-link to="/"
      class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      active-class="bg-sidebar-accent text-sidebar-accent-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span v-show="!collapsed">Home</span>
    </router-link>
  </nav>
</template>
```

- [ ] **Step 2: 验证文件创建成功**

```bash
npx vue-tsc --noEmit src/layout/sidebar/SidebarNav.vue
```

Expected: no errors.

---

### Task 3: 创建 SidebarLogo.vue

**Files:**
- Create: `src/layout/sidebar/SidebarLogo.vue`

- [ ] **Step 1: 创建 SidebarLogo.vue**

通过 props 接收 `collapsed`，通过 emits 发送 `toggle` 事件。

```vue
<script setup lang="ts">
defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div class="flex h-14 items-center justify-between px-4">
    <span v-show="!collapsed" class="text-sm font-semibold text-sidebar-foreground">
      AuzelWeb
    </span>
    <button
      class="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      @click="emit('toggle')">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <template v-if="collapsed">
          <path d="m9 18 6-6-6-6" />
        </template>
        <template v-else>
          <path d="m15 18-6-6 6-6" />
        </template>
      </svg>
    </button>
  </div>
</template>
```

- [ ] **Step 2: 验证文件创建成功**

```bash
npx vue-tsc --noEmit src/layout/sidebar/SidebarLogo.vue
```

Expected: no errors.

---

### Task 4: 创建 Sidebar.vue

**Files:**
- Create: `src/layout/sidebar/Sidebar.vue`

- [ ] **Step 1: 创建 Sidebar.vue**

持有 `collapsed` 状态，组装 SidebarLogo、SidebarNav、SidebarThemeToggle。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import SidebarLogo from './SidebarLogo.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarThemeToggle from './SidebarThemeToggle.vue'

const collapsed = ref(false)
</script>

<template>
  <aside class="flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-60'">
    <SidebarLogo :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <SidebarNav :collapsed="collapsed" />
    <SidebarThemeToggle :collapsed="collapsed" />
  </aside>
</template>
```

- [ ] **Step 2: 验证文件创建成功**

```bash
npx vue-tsc --noEmit src/layout/sidebar/Sidebar.vue
```

Expected: no errors.

---

### Task 5: 重写 DefaultLayout.vue

**Files:**
- Modify: `src/layout/DefaultLayout.vue`

- [ ] **Step 1: 简化为纯布局容器**

将 DefaultLayout.vue 替换为只做 flex 布局的容器组件：

```vue
<script setup lang="ts">
import Sidebar from './sidebar/Sidebar.vue'
</script>

<template>
  <div class="flex h-full">
    <Sidebar />
    <main class="flex-1 overflow-hidden">
      <router-view />
    </main>
  </div>
</template>
```

- [ ] **Step 2: 验证完整构建**

```bash
npx vue-tsc --noEmit
```

Expected: no errors. App.vue 引用路径无需改动。

---

### Task 6: 验证和清理

**Files:**
- 无新建文件
- 检查文件: `src/layout/DefaultLayout.vue`, `src/layout/sidebar/*.vue`

- [ ] **Step 1: 运行开发服务器确认页面正常**

```bash
npx vite --port 5173
```

手动验证：
1. 侧边栏折叠/展开正常
2. 导航链接点击正常跳转
3. 暗黑模式切换动画正常

- [ ] **Step 2: 确认无遗留引用**

```bash
grep -r "toggleDark\|toggleTheme\|isDark" src/layout/DefaultLayout.vue
```

Expected: no matches（DefaultLayout 中不再有这些引用）。

- [ ] **Step 3: 最终构建测试**

```bash
npx vite build
```

Expected: build succeeds with no errors.
