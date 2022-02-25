import { onActivated, onMounted, onDeactivated, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { UseTimeoutFnAction } from '../useTimeoutFn'
import { AnyFunc } from '@/types/utils'

/** 请求初始化流程 */
export function useInitRequest(
  cb: UseTimeoutFnAction<[], Promise<void>> | AnyFunc,
  config?: {
    before?: AnyFunc
    after?: AnyFunc
    isActive?: Ref<boolean>
  }
) {
  let first = true

  // 在每次判断路由为前进或第一次进入时加载数据
  onMounted(async () => {
    first = false
    if (config?.before) config?.before()
    if ('syncCall' in cb) await cb.syncCall()
    else cb()
    if (config?.after) config?.after()
  })

  const router = useRoute()
  onActivated(async () => {
    if (first && (router.meta.reload || (config?.isActive ? !config?.isActive?.value : false))) {
      if (config?.before) config?.before()
      if ('syncCall' in cb) await cb()
      else cb()
      if (config?.after) config?.after()
    }
  })

  onDeactivated(() => (first = true))
}
