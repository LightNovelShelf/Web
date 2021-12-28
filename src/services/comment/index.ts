import { requestWithSignalr } from '@/services/internal/request'
import { CommentType, GetComment, PostComment } from './types'

/** 公告评论 */
export function postComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('PostComment', req)
}

/** 公告评论回复 */
export function replyComment(req: PostComment.Request) {
  return requestWithSignalr<PostComment.Response>('ReplyComment', req)
}

/** 获取公告评论 */
export function getComment(req: GetComment.Request) {
  return requestWithSignalr<GetComment.Response>('GetComment', req)
}
