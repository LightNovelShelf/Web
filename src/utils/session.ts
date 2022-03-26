import { NOOP } from 'src/const/empty'
import { userAuthenticationDB } from 'src/utils/storage/db'

class TokenStorage {
  private readonly INIT_SOURCE = ''
  private source = this.INIT_SOURCE
  private lastUpdate = 0

  // timeout设置为-1时代表永不过期
  constructor(private timeout: number) {}

  public get(): Readonly<string> {
    if (this.timeout < 0 || Date.now() - this.lastUpdate < this.timeout) {
      return this.source
    }

    return this.INIT_SOURCE
  }
  public set(newValue: string) {
    this.lastUpdate = Date.now()
    this.source = newValue
  }
}

/** 会话密钥 */
export const sessionToken = new TokenStorage(+VUE_SESSION_TOKEN_VALIDITY || 3000)

/** 长期密钥 */
export const longTermToken = {
  get(): Promise<string | null> {
    return userAuthenticationDB.get('RefreshToken')
  },
  set(token: string): Promise<void> {
    return userAuthenticationDB.set('RefreshToken', token).then(NOOP)
  }
}
