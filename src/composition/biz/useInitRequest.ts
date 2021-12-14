import { onActivated, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { safeCall } from '@/utils/safeCall'
import { NOOP } from '@/const/empty'
import { useTimeoutFn, UseTimeoutFnAction } from '../useTimeoutFn'

/** 请求初始化流程 */
export function useInitRequest(cb: UseTimeoutFnAction<[], Promise<void>>) {
  const first = ref<boolean>(true)

  const router = useRoute()
  onActivated(() => {
    console.log('是否需要请求数据:', router.meta.reload)
    if (router.meta.reload) {
      if (first.value) {
        first.value = false
        safeCall(cb.syncCall)()
      } else {
        safeCall(cb)()
      }
    }
  })

  onBeforeRouteUpdate((to, from, next) => {
    cb().then(() => next(), NOOP)
  })
}
