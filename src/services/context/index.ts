import { invokeHub } from '@/services/transport'

import type { GetAnnouncementDetail, GetAnnouncementList, OnlineInfo } from '@/services/context/type'
import type { Card } from '@/types/collaborator'

/** 获取贡献者列表 */
export function getCollaboratorList() {
  return invokeHub<Card[]>('GetCollaboratorList')
}

export function getOnlineInfo() {
  return invokeHub<OnlineInfo>('GetOnlineInfo')
}

export function getAnnouncementList(request: GetAnnouncementList.Request) {
  return invokeHub<GetAnnouncementList.Response>('GetAnnouncementList', request)
}

export function getAnnouncementDetail(request: GetAnnouncementDetail.Request) {
  return invokeHub<GetAnnouncementDetail.Response>('GetAnnouncementDetail', request)
}

export function getBanInfoList() {
  return invokeHub('GetBanList')
}
