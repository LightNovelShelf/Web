import { effectScope, ref, watch } from 'vue'
import { AnyVoidFunc } from 'src/types/utils'
import { safeCall } from '../safeCall'

const notifier = ref(-1)

/** 接口未授权调用通知 */
export const unAuthenticationNotify = {
  /** rxjs Subject.next */
  notify(): void {
    notifier.value += 1
  },
  /** 适合在setup外调用 @return unsubscribe */
  subscribe(cb: AnyVoidFunc): AnyVoidFunc {
    const scope = effectScope()
    scope.run(() => {
      watch(notifier, safeCall(cb))
    })
    return () => scope.stop()
  },
  /** 适合在setup内调用 @return unsubscribe */
  useSubscribe(cb: AnyVoidFunc): AnyVoidFunc {
    return watch(notifier, safeCall(cb))
  }
}
