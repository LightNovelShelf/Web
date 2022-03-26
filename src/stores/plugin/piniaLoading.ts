import 'pinia'
import { _ActionsTree, PiniaPlugin } from 'pinia'
import { computed, ref, Ref } from 'vue'

// 这一坨注释其实时想把同步的action给排除掉，但是就算做到了排除，结果是失去了 loading 跳转函数的能力
// type _EnsureFunc<T> = T extends (...args: any) => any ? T : never
// type _EnsurePromiseReturn<T extends (...args: any) => any> = ReturnType<T> extends Promise<any> ? T : never

type _AsyncActions<A = _ActionsTree, Value = unknown> = {
  // [K in keyof A]: _EnsurePromiseReturn<_EnsureFunc<A[K]>> extends never ? null : Value
  [K in keyof A]: Value
}

interface LoadingProducer<Id, S, G, A> {
  /** @example `{ action1: true, action2: false }` */
  (actions: _AsyncActions<A, boolean | undefined>): boolean | undefined | null
}
interface Loading<Id, S, G, A> {
  (): Ref<boolean>
  (producer: LoadingProducer<Id, S, G, A>): Ref<boolean>
}

// 扩展pinia类型
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
     * const storeLoading = store.useLoading(() => {
     *  // 不返回任何东西
     *  // 或者返回 undefined
     *  // 或者返回 null
     * })
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

/** 获取自增ID */
const _INCREMENT_ID: () => string = (() => {
  let ID = 1
  return () => {
    ID += 1
    return ID.toString(36)
  }
})()

/**
 * 调用记录类型
 *
 * 对应的 storeName.actionName1 的 set 不为空时代表有调用过程；空的时候代表所有调用都结束了或者没有调用
 *
 * @example
 * ```ts
 * {
 *  'storeName': {
 *    'actionName1': new Set(['ID1', 'ID2']),
 *    'actionName2': new Set(['ID3'])
 *  }
 * }
 * ```
 */
interface DispatchRecordState {
  [storeName: string]: {
    [actionName: string]: Set<string>
  }
}

/** 插件初始化 */
export const createPiniaLoading = (): PiniaPlugin => {
  /** 调用记录 */
  const dispatchRecordMap = ref<DispatchRecordState>({})

  // plugin
  return (props) => {
    // 给每个actions套上一个loading设置的逻辑wrap
    const { store, options } = props
    const { $id: storeName } = store

    // 定义 useLoading
    store.useLoading = function (producer?: LoadingProducer<unknown, unknown, unknown, _ActionsTree>): Ref<boolean> {
      const { $id: storeName } = store

      /**
       * @example
       * ```ts
       * {  }
       * ```
       *
       * @example
       * ```ts
       * { action1: true, action2: false }
       * ```
       */
      const loadingMap = computed<_AsyncActions<_ActionsTree, boolean>>(() => {
        /** store级别的调用记录 */
        const storeDispatchRecordMap = dispatchRecordMap.value?.[storeName]

        // 没有map的话就直接返回空对象就好
        if (!storeDispatchRecordMap) {
          return {}
        }

        // 计算 loading，作为 producer 的入参
        return Object.keys(storeDispatchRecordMap).reduce((loadingMap, actionName) => {
          loadingMap[actionName] = !!storeDispatchRecordMap[actionName]?.size
          return loadingMap
        }, {} as any)
      })

      // 返回 producer 的记录
      return computed<boolean>(() => {
        let loading: boolean | undefined

        if (producer) {
          loading = producer(loadingMap.value) ?? undefined
        }

        // 如果loading是 undefined 这种，就当作是全store的loading
        if (loading === undefined) {
          // 迭代整个 loadingMap
          Object.values(loadingMap.value).forEach((bool) => {
            loading = loading || bool
          })
        }

        return !!loading
      })
    }

    // 返回 新的 actions 结构，这个结构会被合并到 store 里，覆盖原来的 actionFunc，从而实现调用记录
    return Object.keys(options.actions).reduce((preStore, actionName) => {
      // 记录原来的action调用句柄
      const originActionFunc = store[actionName].bind(store)

      // 覆盖action定义
      preStore[actionName] = (...args: any[]) => {
        // 每次 action 调用对应一个 actionID
        const actionID = _INCREMENT_ID()

        // 确保 storeName 有值
        if (!dispatchRecordMap.value[storeName]) {
          dispatchRecordMap.value[storeName] = {}
        }
        // 确保 storeName.actionName 有值
        if (!dispatchRecordMap.value[storeName][actionName]) {
          dispatchRecordMap.value[storeName][actionName] = new Set()
        }

        // 记录 actionID
        dispatchRecordMap.value[storeName][actionName].add(actionID)

        // 记录函数调用结果
        const result = originActionFunc(...args)

        // 处理异步调用
        if (result instanceof Promise) {
          result.finally(() => {
            dispatchRecordMap.value[storeName][actionName].delete(actionID)
          })
        } else {
          dispatchRecordMap.value[storeName][actionName].delete(actionID)
        }

        // 返回函数调用结果
        return result
      }
      return preStore
    }, {} as any)
  }
}
