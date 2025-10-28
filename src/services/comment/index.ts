import { requestWithSignalr } from 'src/services/internal/request'

import type { GetComments, PostComment } from './types'

import { CommentType } from './types'

/** 评论 */
export function postComment(req: PostComment.Request) {
  return requestWithSignalr('PostComment', req)
}

/** 回复评论 */
export function replyComment(req: PostComment.Request) {
  return requestWithSignalr('ReplyComment', req)
}

/** 获取评论 */
export function getComments(req: GetComments.Request) {
  return requestWithSignalr<GetComments.Response>('GetComments', req)
}

/** 删除评论 */
export function deleteComment(id: number) {
  return requestWithSignalr('DeleteComment', id)
}
