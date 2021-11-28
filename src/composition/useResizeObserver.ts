import { onMounted, onUnmounted, Ref } from 'vue'

export interface UseResizeObserverAction {
  observer: ResizeObserver
}

/** 对某个元素初始化resize监视 */
export function useResizeObserver(ref: Ref<Element>, cb: () => void): UseResizeObserverAction {
  const observer = new ResizeObserver(cb)

  onMounted(() => {
    observer.observe(ref.value)
  })

  onUnmounted(() => {
    observer.disconnect()
  })

  return { observer }
}
