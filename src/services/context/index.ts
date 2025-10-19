import { requestWithSignalr, defaultRequestOptions } from 'src/services/internal/request'

import type { GetAnnouncementDetail, GetAnnouncementList, OnlineInfo } from 'src/services/context/type'
import type { Card } from 'src/types/collaborator'

/** 获取贡献者列表 */
export function getCollaboratorList() {
  return requestWithSignalr<Card[]>('GetCollaboratorList', {}, defaultRequestOptions)
}

export function getOnlineInfo() {
  return requestWithSignalr<OnlineInfo>('GetOnlineInfo', {}, defaultRequestOptions)
}

export function getAnnouncementList(request: GetAnnouncementList.Request) {
  return requestWithSignalr<GetAnnouncementList.Response>('GetAnnouncementList', request, defaultRequestOptions)
}

export function getAnnouncementDetail(request: GetAnnouncementDetail.Request) {
  return requestWithSignalr<GetAnnouncementDetail.Response>('GetAnnouncementDetail', request, defaultRequestOptions)
}

export function getBanInfoList() {
  return requestWithSignalr('GetBanList', {}, defaultRequestOptions)
}
