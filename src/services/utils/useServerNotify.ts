import { NOOP } from '@/utils/const'
import { onUnmounted, ref, watch } from 'vue'
import { isConnected } from '.'
import { subscribeWithSignalr } from '../internal/request/signalr'

/** 订阅某个接口返回 */
export async function useServerNotify<Res = unknown>(methodName: string, cb: (res: Res) => void) {
  const unsubscribor = ref(NOOP)

  /** 取消订阅 */
  function unsubscribe() {
    try {
      unsubscribor.value()
    } catch (e) {
      // ignore
    }
  }

  if (isConnected.value) {
    unsubscribor.value = await subscribeWithSignalr(methodName, cb)
  } else {
    const stopWatch = watch(isConnected, async (connected) => {
      if (connected) {
        try {
          unsubscribor.value = await subscribeWithSignalr(methodName, cb)
          // 监听一次就够了, signalr断开了也会记住相关订阅回调
          // 不停止的话会监听多次, 更麻烦
          stopWatch()
        } catch (e) {
          //
        }
      }
    })
  }

  // 卸载时自动取消订阅
  // 暂不考虑 unactivate 情况, 考虑了之后就代表还得考虑 activate 重连
  onUnmounted(unsubscribe)

  return unsubscribe
}
