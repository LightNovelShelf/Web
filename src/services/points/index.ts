import { invokeHub } from '@/services/transport'

import type * as Types from './type'

export type { Growth } from './type'

/** 每日签到 */
export function signIn() {
  return invokeHub<Types.SignIn.Response>('SignIn', {})
}

/** 积分流水（分页，最新在前） */
export function getPointLog(req: Types.GetPointLog.Request) {
  return invokeHub<Types.GetPointLog.Response>('GetPointLog', req)
}

/** 金币流水（分页，最新在前） */
export function getCoinLog(req: Types.GetCoinLog.Request) {
  return invokeHub<Types.GetCoinLog.Response>('GetCoinLog', req)
}

/** 指定年月的签到日历 */
export function getSignInCalendar(req: Types.GetSignInCalendar.Request) {
  return invokeHub<Types.GetSignInCalendar.Response>('GetSignInCalendar', req)
}
