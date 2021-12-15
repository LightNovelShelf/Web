import { onActivated, ref } from 'vue'
import { useRoute } from 'vue-router'
import { safeCall } from '@/utils/safeCall'
import { UseTimeoutFnAction } from '../useTimeoutFn'

/** 请求初始化流程 */
export function useInitRequest(cb: UseTimeoutFnAction<[], Promise<void>>) {
  const first = ref<boolean>(true)

  const router = useRoute()
  // 在每次判断路由为前进或第一次进入时加载数据
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
}
