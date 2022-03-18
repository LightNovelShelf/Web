import { AnyFunc } from 'src/types/utils'
import { NOOP } from 'src/const/empty'

/**
 * catch 住所有错误的调用
 *
 * @example
 * ```js
 * // 裹住同步函数
 * safeCall(thrownFunc)()
 * ```
 * @example
 * ```js
 * // 裹住异步函数
 * safeCall(thrownAsyncFunc)()
 * ```
 * @example
 * ```js
 * // 裹住函数后丢给watch或者别的vue生命周期
 * watch(ref, safeCall(thrownFunc))
 * watch(ref, safeCall(thrownAsyncFunc))
 * ```
 */
export function safeCall<Func extends AnyFunc = AnyFunc>(cb: Func): Func {
  return function (...args: Parameters<Func>) {
    try {
      const result = cb(...args)
      if (result instanceof Promise) {
        return result.catch(NOOP)
      }
      return result
    } catch (e) {
      // ignore
    }
  } as Func
}
