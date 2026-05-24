import { onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'

/**
 * GSAP composable — 自动管理动画生命周期。
 * 组件卸载时 revert 所有动画，防止残留样式。
 *
 * @param scope - 可选的元素 ref，限制 context 的选择器范围
 */
export function useGsap(scope?: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | null = null

  /** 在受管理的 context 内执行动画回调 */
  function run(callback: gsap.ContextFunc) {
    ctx = gsap.context(callback, scope?.value ?? undefined)
  }

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
  })

  return { gsap, run }
}
