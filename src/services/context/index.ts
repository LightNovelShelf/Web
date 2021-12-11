import { requestWithSignalr } from '@/services/internal/request'
import { Card } from '@/types/collaborator'
import { GetAnnouncementDetail, GetAnnouncementList, OnlineInfo } from '@/services/context/type'

/** 获取贡献者列表 */
export function getCollaboratorList() {
  return requestWithSignalr<Card[]>('GetCollaboratorList')
}

export function getOnlineInfo() {
  return requestWithSignalr<OnlineInfo>('GetOnlineInfo')
}

export function getAnnouncementList(request: GetAnnouncementList.Request) {
  return requestWithSignalr<GetAnnouncementList.Response>('GetAnnouncementList', request)
}

export function getAnnouncementDetail(request: GetAnnouncementDetail.Request) {
  return requestWithSignalr('GetAnnouncementDetail', request)
}
