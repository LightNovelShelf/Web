import { sleep } from '@/utils/sleep'
import { onUnmounted } from 'vue'

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
  const shouldContinute = { value: true }
  /** 停止循环 */
  const unsubscribe = () => {
    shouldContinute.value = false
  }

  async function loop() {
    while (shouldContinute.value) {
      await sleep(ms)
      cb()
    }
  }

  loop()

  onUnmounted(unsubscribe)

  return unsubscribe
}
