import { NOOP } from '@/utils/const'
import { onUnmounted, ref } from 'vue'
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

  // 立即执行
  try {
    unsubscribor.value = await subscribeWithSignalr(methodName, cb)
  } catch (e) {
    // ignore
  }

  // 卸载时自动取消订阅
  // 暂不考虑 unactivate 情况, 考虑了之后就代表还得考虑 activate 重连
  onUnmounted(unsubscribe)

  return unsubscribe
}
