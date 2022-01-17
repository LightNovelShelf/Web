import { rebootSignalr, requestWithFetch, requestWithSignalr } from '@/services/internal/request'
import { PATH } from '@/services/path'
import { longTermToken, sessionToken } from '@/utils/session'

import * as Types from './type'
import { RequestMethod } from '@/services/types'
import { ShelfItem } from '@/types/shelf'

/** 登录 */
export async function login(email: string, password: string, token: string) {
  const res = await requestWithFetch<Types.Login.Res, Types.Login.Param>(PATH.USER_LOGIN, {
    payload: { email, password, token }
  })

  // 记录到全局变量中, 方便其它业务取值
  sessionToken.set(res.Token)

  // 记录到DB缓存中, 方便下次会话使用它来换取token
  await longTermToken.set(res.RefreshToken)

  // 重启链接
  await rebootSignalr()

  // 触发一次请求, 连接ws服务
  // 登录就是为了连接ws服务, 连接失败的话等于没有登录
  // 所以这里await
  const myInfo = await getMyInfo()

  return [res, myInfo]
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

/** 获取用户信息 */
export async function getMyInfo() {
  return requestWithSignalr('GetMyInfo')
}

/** 获取用户阅读历史 */
export async function getReadHistory() {
  return requestWithSignalr<[]>('GetReadHistory')
}

export async function sendResetEmail(email: string, token: string) {
  await requestWithFetch<void, { email: string; token: string }>(PATH.USER_SEND_RESET_EMAIL, {
    payload: { email, token },
    method: RequestMethod.GET
  })
}

export async function sendRegisterEmail(email: string, token: string) {
  await requestWithFetch<void, { email: string; token: string }>(PATH.USER_SEND_REGISTER_EMAIL, {
    payload: { email, token },
    method: RequestMethod.GET
  })
}

export async function resetPassword(email: string, newPassword: string, code: string) {
  await requestWithFetch<void, { email: string; code: string; newPassword: string }>(PATH.USER_RESET_PASSWORD, {
    payload: { email, code, newPassword }
  })
}

export async function register(userName: string, email: string, password: string, code: string) {
  const res = await requestWithFetch<
    Types.Login.Res,
    { userName: string; email: string; code: string; password: string }
  >(PATH.USER_REGISTER, {
    payload: { userName, email, password, code }
  })

  sessionToken.set(res.Token)
  await longTermToken.set(res.RefreshToken)
  await rebootSignalr()
  const myInfo = await getMyInfo()

  return [res, myInfo]
}

/** 保存用户书架信息 */
export async function saveBookShelf(json: { data: ShelfItem[] }) {
  return requestWithSignalr('SaveBookShelf', json)
}

/** 取用户书架信息 */
export async function getBookShelf() {
  return requestWithSignalr<{ data: ShelfItem[] }>('GetBookShelf')
}

/** 清空用户历史记录 */
export async function clearHistory() {
  return requestWithSignalr('ClearHistory')
}
