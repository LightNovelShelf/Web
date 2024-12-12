import { computed, ref, watch } from 'vue'

import type { Ref, WritableComputedRef } from 'vue';

/** @private */
const nil = Symbol()

/** @private */
type Nil = typeof nil

export interface UseMergeStateAction {
  reset(): void
}

/** 实现 有内部中间状态的 受控逻辑 */
export function useMergeState<T>(propsValue: Ref<T>): [WritableComputedRef<T>, UseMergeStateAction] {
  const state = ref<T | Nil>(nil)

  const val = computed<T>({
    get() {
      return state.value === nil ? propsValue.value : (state.value as T)
    },
    set(newVal) {
      // @ts-expect-error ts没检测出来T和Nil一定正交
      state.value = newVal
    },
  })

  function reset() {
    state.value = nil
  }

  watch(propsValue, reset, { flush: 'sync' })

  return [val, { reset }]
}
