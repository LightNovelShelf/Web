import { onUnmounted, getCurrentInstance } from 'vue'

/**
 * 指定间隔调用回调, 返回取消订阅函数
 *
 * @example
 * ```ts
 * const manyDates = ref([ {date: 0}, {date: 1} ])
 *
 * const unsubscribe = tickSource(() => {
 *  manyDates.value.forEach(item => {
 *    item.date = Date.now()
 *  })
 * })
 *
 * onBeforeUnmount(unsubscribe)
 *
 * return { manyDates }
 * ```
 */
export function useTickSource(cb: () => unknown, ms = 1000): () => void {
  const id = setInterval(cb, ms)

  /** 停止循环 */
  const unsubscribe = () => {
    clearInterval(id)
  }

  const instance = getCurrentInstance()
  // 判断当前组件实例是否存在
  if (instance) {
    onUnmounted(unsubscribe)
  }

  return unsubscribe
}
