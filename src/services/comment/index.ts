import { requestWithSignalr } from '@/services/internal/request'
import { GetComment, PostComment } from './types'

/** 公告评论 */
export function PostComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('PostComment', req)
}

/** 公告评论回复 */
export function replyAnnouncementComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('ReplyAnnouncementComment', req)
}

/** 获取公告评论 */
export function GetComment(req: GetComment.Request) {
  return requestWithSignalr<GetComment.Response>('GetComment', req)
}

/** 书籍评论 */
export function postBookComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('PostBookComment', req)
}

/** 书籍评论回复 */
export function replyBookComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('ReplyBookComment', req)
}

/** 获取书籍评论 */
export function getBookComment(req: GetComment.Request) {
  return requestWithSignalr<GetComment.Response>('GetBookComment', req)
}
