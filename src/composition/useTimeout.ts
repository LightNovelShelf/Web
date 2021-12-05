import { AnyVoidFunc } from '@/types/utils'
import { getCurrentInstance, onActivated, onDeactivated, onUnmounted, ref } from 'vue'
import { onBeforeRouteUpdate, RouteParams } from 'vue-router'

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
