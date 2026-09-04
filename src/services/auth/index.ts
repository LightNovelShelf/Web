import { PATH } from '@/services/path'
import { requestHttp } from '@/services/transport/http'
import { restartRealtimeConnection } from '@/services/transport/realtime'
import { RequestMethod } from '@/services/types'
import { getMyInfo } from '@/services/user'

import { clearSessionCredentials, setRefreshToken, storeSessionCredentials } from './session'

import type { LoginRequest, RegisterRequest, SessionCredentials } from './types'
import type { CurrentUser } from '@/services/user/type'

async function completeAuthentication(credentials: SessionCredentials): Promise<CurrentUser> {
  await storeSessionCredentials(credentials)
  await restartRealtimeConnection()
  return getMyInfo()
}

export async function login(email: string, password: string): Promise<CurrentUser> {
  const credentials = await requestHttp<SessionCredentials, LoginRequest>(PATH.USER_LOGIN, {
    payload: { email, password },
  })
  return completeAuthentication(credentials)
}

export async function register(
  userName: string,
  email: string,
  password: string,
  code: string,
  inviteCode: string,
): Promise<CurrentUser> {
  const credentials = await requestHttp<SessionCredentials, RegisterRequest>(PATH.USER_REGISTER, {
    payload: { userName, email, password, code, inviteCode },
  })
  return completeAuthentication(credentials)
}

export async function logout(): Promise<void> {
  await clearSessionCredentials()
  await restartRealtimeConnection()
}

export function sendResetEmail(email: string): Promise<void> {
  return requestHttp<void, { email: string }>(PATH.USER_SEND_RESET_EMAIL, {
    payload: { email },
    method: RequestMethod.GET,
  })
}

export function sendRegisterEmail(email: string): Promise<void> {
  return requestHttp<void, { email: string }>(PATH.USER_SEND_REGISTER_EMAIL, {
    payload: { email },
    method: RequestMethod.GET,
  })
}

export function resetPassword(email: string, newPassword: string, code: string): Promise<void> {
  return requestHttp<void, { email: string; code: string; newPassword: string }>(PATH.USER_RESET_PASSWORD, {
    payload: { email, code, newPassword },
  })
}

export { setRefreshToken }
