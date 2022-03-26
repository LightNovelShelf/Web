import { lastResponseCache } from 'src/services/internal/request/signalr/cache'
import { watch } from 'vue'

/** 监听cache使用情况 */
export const useCacheNotify = (cb: (lastCache: Promise<unknown>) => void) => {
  watch(lastResponseCache.value || {}, () => cb(Promise.resolve(lastResponseCache.value)))
}
