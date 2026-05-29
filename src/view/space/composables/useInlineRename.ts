import { ref, nextTick } from 'vue'

interface UseInlineRenameOptions {
  /** 重命名完成时的回调，只有名称真正改变时才会调用 */
  onComplete: (itemId: string, newName: string) => void
}

/**
 * 内联重命名 composable — 统一 DesktopIcon / FolderIcon / FolderPanel 的重命名逻辑。
 *
 * 核心修复：在设置状态（退出编辑模式）**之前**读取 DOM，
 * 避免 Vue 移除 contenteditable 元素后 ref 为 null 导致丢失用户输入。
 */
export function useInlineRename(opts: UseInlineRenameOptions) {
  /** 当前正在重命名的项 ID，null 表示未在编辑 */
  const renamingId = ref<string | null>(null)
  const inputRef = ref<HTMLSpanElement | null>(null)

  /** 进入编辑模式，选中全部文本 */
  function startRename(itemId?: string) {
    renamingId.value = itemId ?? '__single__'
    nextTick(() => {
      const el = inputRef.value
      if (!el) return
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    })
  }

  /** 完成重命名：先读 DOM，再退出编辑，最后回调 */
  function finishRename(getCurrentName: (itemId: string) => string) {
    const id = renamingId.value
    if (!id) return // 防重入 guard

    // 1. 在 Vue 移除元素之前读取 DOM 文本
    const trimmed = (inputRef.value?.innerText ?? '').trim()

    // 2. 退出编辑模式（Vue 将移除 contenteditable 元素）
    renamingId.value = null

    // 3. 仅在名称非空且有变化时回调（id 已提前捕获）
    if (trimmed && trimmed !== getCurrentName(id)) {
      opts.onComplete(id, trimmed)
    }
  }

  /** 键盘事件处理：Enter 确认，Escape 取消 */
  function onKeydown(e: KeyboardEvent, getCurrentName: (itemId: string) => string) {
    if (e.key === 'Enter') {
      e.preventDefault()
      finishRename(getCurrentName)
    }
    if (e.key === 'Escape') {
      renamingId.value = null
    }
  }

  return { renamingId, inputRef, startRename, finishRename, onKeydown }
}
