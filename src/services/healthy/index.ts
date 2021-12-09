import { requestWithSignalr, rebootSignalr } from '@/services/internal/request'

/** 重启链接, 登录后需要重新建立链接才能通知服务器告诉它我登录了 */
export function rebootServer() {
  return rebootSignalr()
}
/** 心跳, 用来检查服务器是否在线或者触发一次ws连接 */
export function checkServer() {
  return requestWithSignalr('CheckServer')
}
