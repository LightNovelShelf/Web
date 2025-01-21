import { longTermToken, sessionToken } from 'src/utils/session'

import { connectState as _connectState } from 'src/services/internal/request/signalr'

import { ServerError } from '../internal/ServerError'
import { refreshToken } from '../user'

/** 连接状态 */
export const connectState = _connectState

export { useCacheNotify } from './useCacheNotify'
export { useServerNotify } from './useServerNotify'

/** 会自动尝试刷新Token */
export const getSessionToken = async () => {
  let token = sessionToken.get()
  if (!token) {
    // 如果没有,查询是否有 longTermToken
    const _token = await longTermToken.get()
    // 如果有, 用它来换取会话token
    if (_token) {
      try {
        token = await refreshToken('' + _token)
      } catch (error) {
        // -100 token失效, 404 token不存在
        if (error instanceof ServerError && [-100, 404].includes(error.status)) {
          await longTermToken.set('')
        }
      }
    }
  }
  return token
}
