import { onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import type { Ref } from 'vue'

/**
 * 被动触发的请求延后这么久再发
 *
 * @description
 * 连按后退会一路穿过多个缓存页面，连点分页器会连着改 url，
 * 延后一拍，这些中途状态的请求还没发出去就被下一次调度取消了
 */
const PASSIVE_DELAY_MS = 200

/** 本次请求因何发起 */
export type InitRequestReason = 'mount' | 'params' | 'activate'

/**
 * 请求初始化流程
 *
 * @param cb 发起请求，入参是 params 的当前值与本次请求的来源；要在请求前后做别的事就自己在这里包
 * @param params 请求参数快照，一般是路由参数。页面停留期间它一变就防抖重新请求；
 * keep-alive 回到本页时，前进一律重新请求，后退只有它与上次请求时不同才重新请求，相同就沿用页面缓存
 * @returns `data` 是 cb 的返回值，`loading` 与 `error` 覆盖本流程发起的每次请求，`reload` 立刻重来一次
 */
export function useInitRequest<P = void, R = unknown>(
  cb: (params: P, reason: InitRequestReason) => R | Promise<R>,
  params?: () => P,
) {
  const route = useRoute()
  // keep-alive 下离开本页后 route 还在变，params 跟着变，靠路由名挡住
  const routeName = route.name

  let first = true
  let loadedParams: string | undefined

  const snapshot = () => (params ? JSON.stringify(params() ?? null) : undefined)

  const data = ref<Awaited<R>>() as Ref<Awaited<R> | undefined>
  const loading = ref(false)
  const error = ref<unknown>(null)

  let pending: number | undefined
  const cancelPending = () => {
    if (pending === undefined) return

    clearTimeout(pending)
    pending = undefined
  }

  const call = async (reason: InitRequestReason = 'mount') => {
    cancelPending()

    const current = params?.() as P
    loadedParams = params ? JSON.stringify(current ?? null) : undefined
    loading.value = true
    error.value = null
    try {
      data.value = await cb(current, reason)
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const defer = (reason: InitRequestReason) => {
    cancelPending()
    pending = window.setTimeout(() => {
      pending = undefined
      void call(reason)
    }, PASSIVE_DELAY_MS)
  }

  onMounted(async () => {
    first = false
    await call('mount')
  })

  watch(snapshot, (next) => {
    if (route.name !== routeName || next === loadedParams) return

    defer('params')
  })

  onActivated(() => {
    if (!first) return

    // meta.reload 由 router/index.ts 的 afterEach 维护：落在最新一条历史记录上即前进
    if (route.meta.reload) {
      void call('activate')
      return
    }

    if (snapshot() !== loadedParams) defer('activate')
  })

  onDeactivated(() => {
    first = true
    cancelPending()
  })

  onUnmounted(cancelPending)

  return { data, loading, error, reload: () => call('mount') }
}
