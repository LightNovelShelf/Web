import { requestWithFetch } from '@/services/internal/request'
import { PATH } from '@/services/path'

import * as Types from './type'
export { Types as UserServicesTypes }

export function login(email: string, password: string, token: string) {
  return requestWithFetch<Types.Login.Res, Types.Login.Param>(PATH.USER_LOGIN, {
    payload: { email, password, token }
  })
}

export function refreshToken(token: string) {
  return requestWithFetch<Types.RefreshToken.Res, Types.RefreshToken.Param>(PATH.USER_REFRESH_TOKEN, {
    payload: { token }
  })
}
