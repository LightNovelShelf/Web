import { AnyVoidFunc } from '@/types/utils'
import { onMounted, onBeforeUnmount, onActivated, onDeactivated, ref } from 'vue'
import { useTimeout } from './useTimeout'

type CleanUp = AnyVoidFunc | void | undefined | null

export interface UseInitCB {
  (): CleanUp
}

/**
 * onActivated回调延时
 *
 * @description
 * 这个延时是为了解决
 * **用户在快速后退页面时，会在 onActivated 周期产生大量无用请求**
 * 的问题
 */
const DELAY_MS = 200

/**
 * 页面初始化hook
 *
 * @description
 * 传入cb，cb可返回清理函数(cleanup)
 *
 * cb 会在 onMounted 或者 onActivated (延时)执行
 *
 * cleanup 会在 onBeforeUnmount 或者 onDeactivated 执行
 */
export function useInit(cb: UseInitCB, delay = DELAY_MS) {
  const lastCleanUp = ref<CleanUp>()

  const _cb = cb.bind(this)

  onMounted(() => {
    lastCleanUp.value = _cb()
  })

  // 激活时延时执行init逻辑
  onActivated(() => {
    useTimeout(() => (lastCleanUp.value = _cb()), delay)
  })

  /**
   * 如果用户返回了cleanup，执行一次
   *
   * @description
   * 不能假设 cleanup 可重复运行，所以只要调用一次就要清掉这个 cleanup 记录
   */
  function runCleanup() {
    if (typeof lastCleanUp.value === 'function') {
      // 解构出来，防止 cleanup 的 this 变成 lastCleanUp
      const cleanup = lastCleanUp.value
      // 先移除记录再执行，防止函数报错就不清理
      lastCleanUp.value = undefined

      try {
        cleanup()
      } catch (e) {
        //
      }
    }
  }

  onDeactivated(runCleanup)
  onBeforeUnmount(runCleanup)
}
