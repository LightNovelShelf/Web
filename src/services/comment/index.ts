import { requestWithSignalr } from '@/services/internal/request'
import { Card } from '@/types/collaborator'
import { GetAnnouncementComment, PostAnnouncementComment } from './types'

/** 评论公告 */
export function postAnnouncementComment(req: PostAnnouncementComment.Request) {
  return requestWithSignalr<PostAnnouncementComment.Response>('PostAnnouncementComment', req)
}

/** 获取公告评论 */
export function getAnnouncementComment(req: GetAnnouncementComment.Request) {
  return requestWithSignalr<GetAnnouncementComment.Response>('GetAnnouncementComment', req)
}
