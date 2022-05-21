import { type Ref } from 'vue'

/**
 * 用来获取vue组件内别的node元素的ref
 *
 * @example 基础用法
 * ```xml
 * <!-- 注意 custom-el-ref 前边有冒号 -->
 * <custom-component :custom-el-ref="getEl" />
 * ```
 * ```js
 * const [getEl, elRef] = useForwardRef()
 *
 * watch(elRef, el => {
 *  if (!el) {
 *    // 组件还没挂载等，反正就是ref还没拿到
 *  }
 *
 *  console.log('node ref:', el)
 * })
 * ```
 *
 * @example 标记类型
 * ```ts
 * // elRef.value 会拿到 `HTMLInputElement | null` 的类型
 * const [getEl, elRef] = useForwardRef<HTMLInputElement>()
 * ```
 *
 */
export function useForwardRef<Element = HTMLElement>() {
  const elRef: Ref<Element | null> = ref(null)
  function setElRef(el: Element) {
    elRef.value = el
  }

  return [elRef, setElRef] as const
}
