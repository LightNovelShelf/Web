import { computed } from 'vue'

import { connectState as _connectState } from 'src/services/internal/request/signalr'

/** 连接状态 */
export const connectState = _connectState

export { useCacheNotify } from './useCacheNotify'
