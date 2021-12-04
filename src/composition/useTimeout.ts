import { AnyVoidFunc } from '@/types/utils'
import { getCurrentInstance, onActivated, onDeactivated, onUnmounted, ref } from 'vue'

/**
 * 延时执行，当组件被 deactive 或者 unmount 的时候就不执行相关cb
 *
 * @description
 * 只能在 setup 或者 生命周期内同步执行
 */
export function useTimeout(cb: AnyVoidFunc, delay?: number) {
  /** 获取当前实例 */
  const instance = getCurrentInstance()
  /** 计算当前组件时候是激活状态 */
  const currentActived = !!(instance?.isMounted && !instance?.isDeactivated)

  /** 组件是否可见 */
  const actived = ref(currentActived)
  const _cb = cb.bind(this)

  setTimeout(() => {
    if (!actived.value) {
      return
    }
    _cb()
  }, delay)

  onDeactivated(() => (actived.value = false))
  onActivated(() => (actived.value = true))
  onUnmounted(() => (actived.value = false))
}
