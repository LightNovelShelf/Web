import { requestWithFetch } from '@/services/internal/request'
import { PATH } from '@/services/path'
import { sessionToken, longTermToken } from '@/utils/session'
import { checkServer } from '@/services/healthy'

import * as Types from './type'
export { Types as UserServicesTypes }

/** 登录 */
export async function login(email: string, password: string, token: string) {
  const res = await requestWithFetch<Types.Login.Res, Types.Login.Param>(PATH.USER_LOGIN, {
    payload: { email, password, token }
  })

  // 记录到全局变量中, 方便其它业务取值
  sessionToken.set(res.Token)

  // 记录到DB缓存中, 方便下次会话使用它来换取token
  await longTermToken.set(res.RefreshToken)

  // 触发一次请求, 连接ws服务
  // 登录就是为了连接ws服务, 连接失败的话等于没有登录
  // 所以这里await
  await checkServer()

  return res
}

/** 换取会话密钥 */
export async function refreshToken(longTermToken: string) {
  const token = await requestWithFetch<Types.RefreshToken.Res, Types.RefreshToken.Param>(PATH.USER_REFRESH_TOKEN, {
    payload: { token: longTermToken }
  })

  /** 刷新成功后自动更新会话密钥 */
  if (token) {
    sessionToken.set(token)
  }

  return token
}
