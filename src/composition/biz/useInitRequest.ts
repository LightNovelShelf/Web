import { onActivated, onMounted, onDeactivated } from 'vue'
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
  let first = true

  // 在每次判断路由为前进或第一次进入时加载数据
  onMounted(async () => {
    first = false
    if (before) before()
    await safeCall(cb.syncCall)()
    if (after) after()
  })

  const router = useRoute()
  onActivated(async () => {
    if (first && router.meta.reload) {
      if (before) before()
      await safeCall(cb)()
      if (after) after()
    }
  })

  onDeactivated(() => (first = true))
}
