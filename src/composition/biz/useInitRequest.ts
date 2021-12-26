import { onActivated, ref } from 'vue'
import { useRoute } from 'vue-router'
import { safeCall } from '@/utils/safeCall'
import { UseTimeoutFnAction } from '../useTimeoutFn'
import { AnyFunc } from '@/types/utils'

/** 请求初始化流程 */
export function useInitRequest(
  cb: UseTimeoutFnAction<[], Promise<void>>,
  before: AnyFunc = null,
  after: AnyFunc = null
) {
  const first = ref<boolean>(true)

  const router = useRoute()
  // 在每次判断路由为前进或第一次进入时加载数据
  onActivated(async () => {
    console.log('是否需要请求数据:', router.meta.reload)
    if (router.meta.reload) {
      if (before) before()
      if (first.value) {
        first.value = false
        await safeCall(cb.syncCall)()
      } else {
        await safeCall(cb)()
      }
      if (after) after()
    }
  })
}
