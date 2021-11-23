import { computed } from 'vue'
import { isConnected as _isConnected, connectPromise } from '@/services/internal/request/signalr'

/** 是否已经建立ws连接 */
export const isConnected = _isConnected

/** 是否正在建立ws连接 */
export const isConnecting = computed(() => !!connectPromise.value)

export { useCacheNotify } from './useCacheNotify'
