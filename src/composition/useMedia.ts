import { ref, Ref, watchEffect, onUnmounted } from 'vue'

/**
 * 返回一个定时刷新的 'xx天前' 文案
 */
export function useMedia(query: string, defaultVal = false): Ref<boolean> {
  /** 是否匹配 */
  const isMatch = ref(defaultVal)
  /** 根据query构建的MediaQueryList语法 */
  const mql = ref<MediaQueryList>(window.matchMedia(query))

  /** 因为 MediaQueryList change的时候不会触发vue的渲染，所以这里用一个callback来单独触发一次 */
  const matchChangeHandle = () => {
    isMatch.value = mql.value.matches
  }

  /** 根据query重建mql */
  const rematchHandle = () => {
    /** 先清理 */
    mql.value.removeEventListener('change', matchChangeHandle)
    /** 重建 */
    mql.value = window.matchMedia(query)
    /** 重新监听 */
    mql.value.addEventListener('change', matchChangeHandle)
  }
  // rematchHandle里touch过的值变化了就重新运行一次，这里对应的就是query
  watchEffect(rematchHandle)

  onUnmounted(() => {
    mql.value.removeEventListener('change', matchChangeHandle)
  })

  return isMatch
}
