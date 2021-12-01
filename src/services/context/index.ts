import { requestWithSignalr } from '@/services/internal/request'
import { Card } from '@/types/collaborator'
import { OnlineInfo } from '@/services/context/type'

/** 获取贡献者列表 */
export function getCollaboratorList() {
  return requestWithSignalr<Card[]>('GetCollaboratorList')
}

export function getOnlineInfo() {
  return requestWithSignalr<OnlineInfo>('GetOnlineInfo')
}
