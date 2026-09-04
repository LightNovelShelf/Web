import { userAuthenticationDB } from '@/utils/storage/db'

class AccessTokenStorage {
  private value = ''
  private updatedAt = 0

  constructor(private readonly validityMs: number) {}

  get(): string {
    if (this.validityMs < 0 || Date.now() - this.updatedAt < this.validityMs) return this.value
    return ''
  }

  set(value: string): void {
    this.value = value
    this.updatedAt = Date.now()
  }
}

export const accessTokenStorage = new AccessTokenStorage(+import.meta.env.VUE_SESSION_TOKEN_VALIDITY || 3_000)

export const refreshTokenStorage = {
  get: () => userAuthenticationDB.get('RefreshToken'),
  set: (token: string) => userAuthenticationDB.set('RefreshToken', token),
}
