import { userAuthenticationDB } from '@/utils/storage/db'

/** @private 会话密钥 */
let _sessionToken = ''

/** 会话密钥 */
export const sessionToken = {
  get(): string {
    return _sessionToken
  },
  set(token: string): void {
    _sessionToken = token
  }
}

/** 长期密钥 */
export const longTermToken = {
  get(): Promise<string | null> {
    return userAuthenticationDB.get('RefreshToken')
  },
  set(token: string): Promise<void> {
    return userAuthenticationDB.set('RefreshToken', token)
  }
}
