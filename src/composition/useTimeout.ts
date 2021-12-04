import { AnyVoidFunc } from '@/types/utils'
import { getCurrentInstance, onActivated, onDeactivated, onUnmounted, ref } from 'vue'

/**
 * 延时执行，当组件被 deactivate 或者 unmount 的时候就不执行相关cb
 *
 * @description
 * 只能在 setup 或者 生命周期内同步执行
 */
export function useTimeout(cb: AnyVoidFunc, delay?: number) {
  /** 获取当前实例 */
  const instance = getCurrentInstance()
  /** 计算当前组件时候是激活状态 */
  const currentActivated = !!(instance?.isMounted && !instance?.isDeactivated)

  /** 组件是否可见 */
  const activated = ref(currentActivated)
  const _cb = cb.bind(this)

  setTimeout(() => {
    if (!activated.value) {
      return
    }
    _cb()
  }, delay)

  onDeactivated(() => (activated.value = false))
  onActivated(() => (activated.value = true))
  onUnmounted(() => (activated.value = false))
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
