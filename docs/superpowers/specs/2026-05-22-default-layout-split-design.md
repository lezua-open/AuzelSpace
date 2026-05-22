# DefaultLayout 组件拆分

## 目标

将 [DefaultLayout.vue](../../../src/layout/DefaultLayout.vue)（97 行）按功能区域拆分为独立组件，放入 `layout/sidebar/` 文件夹。

## 拆分结构

```
src/layout/
  DefaultLayout.vue          → flex 容器，组合 Sidebar + <router-view>
  sidebar/
    Sidebar.vue               → <aside> 容器，持有 collapsed 状态
    SidebarLogo.vue           → logo 文字 + 折叠/展开按钮
    SidebarNav.vue            → 导航菜单（router-link）
    SidebarThemeToggle.vue    → 暗黑模式切换（useDark + startViewTransition + SVG 图标）
```

## 数据流

- `collapsed` 状态由 Sidebar.vue 定义并持有
- Sidebar.vue 通过 props 将 `collapsed` 传给 SidebarLogo、SidebarNav、SidebarThemeToggle
- SidebarThemeToggle 内部持有 `isDark` 和 `toggleTheme`（不向外暴露）
- DefaultLayout.vue 不持有任何状态，纯布局组件

## 兼容性

- App.vue 仍引用 `@/layout/DefaultLayout.vue`，无需改动
- 各组件的 props 接口保持简单：只需接收 `collapsed: boolean`
- SVG 图标保留在各组件内部（不额外拆分），避免过度拆分
