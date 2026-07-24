import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './type'

export type { Growth } from './type'

/** 每日签到 */
export function signIn() {
  return requestWithSignalr<Types.SignIn.Response>('SignIn', {})
}

/** 积分流水（分页，最新在前） */
export function getPointLog(req: Types.GetPointLog.Request) {
  return requestWithSignalr<Types.GetPointLog.Response>('GetPointLog', req)
}

/** 指定年月的签到日历 */
export function getSignInCalendar(req: Types.GetSignInCalendar.Request) {
  return requestWithSignalr<Types.GetSignInCalendar.Response>('GetSignInCalendar', req)
}
