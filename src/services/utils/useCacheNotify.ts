import { watch } from 'vue'

import { lastResponseCache } from '@/services/internal/request/signalr/cache'

/** 监听cache使用情况 */
export const useCacheNotify = (cb: (lastCache: Promise<unknown>) => void) => {
  watch(lastResponseCache.value || {}, () => cb(Promise.resolve(lastResponseCache.value)))
}
