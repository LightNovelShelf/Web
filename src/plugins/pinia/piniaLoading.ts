import 'pinia'
import { _ActionsTree, PiniaPlugin } from 'pinia'
import { ref, Ref } from 'vue'

// type _EnsureFunc<T> = T extends (...args: any) => any ? T : never
// type _EnsurePromiseReturn<T extends (...args: any) => any> = ReturnType<T> extends Promise<any> ? T : never

type _AsyncActions<A = _ActionsTree, Value = unknown> = {
  // [K in keyof A]: _EnsurePromiseReturn<_EnsureFunc<A[K]>> extends never ? null : Value
  [K in keyof A]: Value
}

interface LoadingProducer<Id, S, G, A> {
  (actions: _AsyncActions<A, boolean>): boolean
}
interface Loading<Id, S, G, A> {
  (): Ref<boolean>
  (producer: LoadingProducer<Id, S, G, A>): Ref<boolean>
}

declare module 'pinia' {
  export interface PiniaCustomProperties<Id, S, G, A> {
    /**
     * 获取 store 异步动作触发状况
     *
     * @example
     * ```ts
     * const store = useShelfStore()
     *
     * // 1. store有任意action触发都会触发loading
     * const storeLoading = store.useLoading()
     *
     * // 2. 根据指定loading组合情况返回loading情况
     * // action1触发了就会返回loading为true
     * const loading1 = store.useLoading((actions) => actions.action1)
     * // action1或action2触发了就会返回loading为true
     * const loading2 = store.useLoading((actions) => actions.action1 || actions.action2)
     * // action1及action2都触发了才会返回loading为true
     * const loading3 = store.useLoading((actions) => actions.action1 && actions.action2)
     * ```
     */
    useLoading: Loading<Id, S, G, A>
  }
}

export const piniaLoading: PiniaPlugin = ({ store }) => {
  // 给每个actions套上一个loading设置的逻辑wrap

  // 导出
  store.useLoading = function (producer?: LoadingProducer<unknown, unknown, unknown, _ActionsTree>): Ref<boolean> {
    return ref(false)
  }
}
