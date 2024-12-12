import { ref, watch, onUnmounted } from 'vue'

import type { Ref} from 'vue';

/**
 * 返回当前屏幕是否匹配传入的query
 *
 * @example
 * ```
 * useMedia(ref('(min-width: 1080px)'))
 * ```
 */
export function useMedia(query: Ref<string>, defaultVal = false): Ref<boolean> {
  /** 是否匹配 */
  const isMatch = ref(defaultVal)

  let mql: MediaQueryList = window.matchMedia(query.value)

  /** 因为 MediaQueryList change的时候不会触发vue的渲染，所以这里用一个callback来单独触发一次 */
  const matchChangeHandle = () => {
    isMatch.value = mql.matches
  }
  mql.addEventListener('change', matchChangeHandle)

  // query里变化了就重新监听
  watch(query, (nextQuery) => {
    /** 先清理 */
    mql.removeEventListener('change', matchChangeHandle)
    /** 重建 */
    mql = window.matchMedia(nextQuery)
    /** 重新监听 */
    mql.addEventListener('change', matchChangeHandle)
  })

  onUnmounted(() => {
    mql.removeEventListener('change', matchChangeHandle)
  })

  return isMatch
}
