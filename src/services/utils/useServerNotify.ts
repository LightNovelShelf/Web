import { onUnmounted } from 'vue'
import { subscribeWithSignalr } from '../internal/request/signalr'

/** 订阅某个接口返回 */
export async function useServerNotify<Res = unknown>(methodName: string, cb: (res: Res) => void) {
  const unSubscriber = subscribeWithSignalr(methodName, cb)

  // 卸载时自动取消订阅
  // 暂不考虑 onDeactivated 情况, 考虑了之后就代表还得考虑 activate 重连
  onUnmounted(unSubscriber)

  return unSubscriber
}
