import { NOOP } from '@/utils/const'
import { AnyVoidFunc, AnyAsyncFunc, AnyFunc } from '@/types/utils'
import { onDeactivated, onUnmounted, Ref, ref } from 'vue'
import { onBeforeRouteUpdate, RouteParams } from 'vue-router'

/** 延时执行 */
export interface UseTimeoutAction<P extends any[] = any[], R = any> extends AnyAsyncFunc<P, Promise<R>> {
  /** 同步执行cb，不走延时 */
  syncCall: AnyFunc<P, R>
  /** 手动取消 */
  cancel: AnyVoidFunc
  /** 是否有执行任务 */
  scheduled: Ref<boolean>
}

/** 延时执行配置项 */
export interface UseTimeoutConfig {
  /** 自动取消，设置为 false 可以阻止自动取消行为 */
  cancelOnUnMount?: boolean
}

/**
 * cancel错误，方便业务判断是cb错误还是只是取消
 *
 * @example
 * ```js
 * const fn = useTimeuot(function () { throw new Error('test') })
 * fn().catch(e => e === CANCEL_ERR ? ( console.log('取消执行'); ) : ( console.log('执行错误'); ) )
 * ```
 */
export const CANCEL_ERR = new Error('cancel')

/**
 * onActivated回调延时
 *
 * @description
 * 这个延时是为了解决
 * **用户在快速后退页面时，会在 onActivated 周期产生大量无用请求**
 * 的问题
 */
const DELAY_MS = 200

/**
 * 延时执行
 *
 * @description
 * 当组件被 deactivate 或者 unmount 的时候就取消相关cb的执行计划
 *
 * @description
 * 重复调用时只有最后一次调用有效
 *
 * @example
 * ```js
 * const fn = useTimeuot(function () { fetch('baidu.com') });
 *
 * fn().catch(
 *    e => e === CANCEL_ERR
 *      ? ( console.log('取消执行') )
 *      : ( console.log('执行错误') )
 * )
 * ```
 */
export function useTimeout<P extends any[] = any[], R = any>(
  cb: AnyFunc<P, R>,
  delay: number = DELAY_MS,
  config?: UseTimeoutConfig
): UseTimeoutAction<P, R> {
  let timeoutContext: NodeJS.Timeout | undefined
  let rejector: ((err?: unknown) => void) | undefined
  /** 是否有执行计划 */
  const scheduled = ref(false)

  /** 清理context相关变量 */
  function reset() {
    timeoutContext = undefined
    rejector = undefined
    scheduled.value = false
  }

  function fn(...args: P) {
    // 取消上一个执行计划，实现单发
    fn.cancel()

    const promise = new Promise<R>((resolve, reject) => {
      scheduled.value = true
      rejector = reject

      timeoutContext = setTimeout(() => {
        try {
          resolve(cb(...args))
        } catch (e) {
          reject(e)
        }

        reset()
      }, delay)
    })

    // 兜底错误，避免开发控制台一直报错
    // 一定要用then来兜底，用catch的话会使外部的catch无法触发从而无法监听取消事件或者cb执行错误事件
    promise.then(NOOP, NOOP)

    return promise
  }

  fn.syncCall = function (...args: P): R {
    scheduled.value = true

    // 这里setTimeout就清理，暂不考虑cb是异步函数然后等它执行完再clean的操作
    setTimeout(reset)
    return cb(...args)
  }
  fn.cancel = function () {
    timeoutContext && clearTimeout(timeoutContext)
    rejector && rejector(CANCEL_ERR)
    reset()
  }

  fn.scheduled = scheduled

  // 组件卸载时取消执行
  onDeactivated(() => config?.cancelOnUnMount !== false && fn.cancel())
  onUnmounted(() => config?.cancelOnUnMount !== false && fn.cancel())

  // actived 时不管，这里只负责取消，业务自己确定调用时机，避免出现无法取消的多余执行

  return fn
}

/**
 * 延时执行，当返回值被置为false就不执行
 */
export function useTimeoutOutVue(cb: AnyVoidFunc, cancelCb?: AnyVoidFunc, delay?: number) {
  /** 组件是否可见 */
  const activated = ref(true)
  const _cb = cb.bind(this)

  setTimeout(() => {
    if (!activated.value) {
      if (cancelCb) cancelCb()
      return
    }
    _cb()
  }, delay)

  return activated
}

/**
 * 在路由更新时延时执行
 */
export function useTimeoutOnRouteUpdate(cb: (RouteParams) => Promise<void>, delay?) {
  let clear: AnyVoidFunc
  const _clear = () => {
    if (clear) {
      clear()
      clear = null
    }
  }

  const _cb = cb.bind(this)

  const call = (params: RouteParams) => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        _cb(params).finally(resolve)
      }, delay)
      clear = () => {
        clearTimeout(id)
        reject('request cancel')
      }
    })
  }

  onBeforeRouteUpdate((to, form, next) => {
    _clear()
    call(to.params).then(next)
  })
  onDeactivated(_clear)
  onUnmounted(_clear)
}
