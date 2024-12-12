import { onActivated, onMounted, onDeactivated } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'

import type { UseTimeoutFnAction } from '../useTimeoutFn'
import type { AnyFunc } from 'src/types/utils'
import type { Ref } from 'vue';


/** 请求初始化流程 */
export function useInitRequest(
  cb: UseTimeoutFnAction<[], Promise<void>> | AnyFunc,
  config?: {
    before?: AnyFunc
    after?: AnyFunc
    isActive?: Ref<boolean>
    onlyRouteEnter?: boolean
  },
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

  if (config?.onlyRouteEnter) {
    onBeforeRouteLeave(() => (first = true))
  } else {
    onDeactivated(() => (first = true))
  }
}
