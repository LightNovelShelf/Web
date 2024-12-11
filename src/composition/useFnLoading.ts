import type { AnyFunc } from 'src/types/utils'
import type { Ref } from 'vue';
import { ref } from 'vue'

export interface UseFnLoadingReturn<P extends any[] = any[], R = any> extends AnyFunc<P, R> {
  loading: Ref<boolean>
}

/** 包裹函数，返回函数执行loading */
export function useLoadingFn<P extends any[] = any[], R = any>(fn: AnyFunc<P, R>): UseFnLoadingReturn<P, R> {
  /**
   * loading相关的变量
   *
   * @description
   * 记录promise是因为要记录产生loading对应的promise，这样的话，假如两次快速调用函数，也不会因为第一次返回了就把loading写为false
   */
  const context = [null, ref(false)] as [unknown, Ref<boolean>]
  const [, loading] = context

  function _fn(...args: P): R {
    loading.value = true

    /** 运行结果 */
    const evalResult = (() => {
      try {
        return fn(...args)
      } catch (e) {
        return Promise.reject(e)
      }
    })()

    // 记录context
    context[0] = evalResult

    Promise.resolve(evalResult).finally(() => {
      // 判断这个loading是不是自己的context的
      if (context[0] === evalResult) {
        // 如果是，清除conetxt记录避免内存泄露
        context[0] = null
        // 然后重置loading
        loading.value = false
      }
      // 如果loading是别人的，那就等别人去重置
    })

    return evalResult as R
  }

  _fn.loading = loading

  return _fn
}
