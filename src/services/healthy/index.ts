import { requestWithSignalr } from '@/services/internal/request'

/** 心跳, 用来检查服务器是否在线或者触发一次ws连接 */
export function checkServer() {
  return requestWithSignalr('CheckServer')
}
