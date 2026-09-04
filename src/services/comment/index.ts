import { invokeHub } from '@/services/transport'

import { CommentType } from './types'

import type { GetComments, PostComment } from './types'

/** 评论 */
export function postComment(req: PostComment.Request) {
  return invokeHub('PostComment', req)
}

/** 回复评论 */
export function replyComment(req: PostComment.Request) {
  return invokeHub('ReplyComment', req)
}

/** 获取评论 */
export function getComments(req: GetComments.Request) {
  return invokeHub<GetComments.Response>('GetComments', req)
}

/** 删除评论 */
export function deleteComment(id: number) {
  return invokeHub('DeleteComment', { Id: id })
}
