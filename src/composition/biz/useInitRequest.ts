import { onActivated, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { AnyFunc } from '@/types/utils'
import { safeCall } from '@/utils/safeCall'
import { NOOP } from '@/const/empty'
import { useTimeoutFn, UseTimeoutFnAction } from '../useTimeoutFn'

/** 请求初始化流程 */
export function useInitRequest(cb: AnyFunc<[], void>): UseTimeoutFnAction<[], void> {
  const first = ref<boolean>(true)
  const _cb = useTimeoutFn(cb)

  onActivated(() => {
    if (first.value) {
      first.value = false
      safeCall(_cb.syncCall)()
    } else {
      safeCall(_cb)()
    }
  })

  onBeforeRouteUpdate((to, from, next) => {
    _cb().then(() => next(), NOOP)
  })

  return _cb
}
