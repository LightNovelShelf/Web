import { invokeHub } from '@/services/transport'

import type * as Types from './type'

export type {
  DirectMessagePeer,
  DirectMessageItem,
  DirectConversationItem,
  RealtimeDirectMessageItem,
  OnDirectMessagePayload,
  OnDirectMessageReadPayload,
  OnDirectMessageBlockChangedPayload,
} from './type'

/** 会话列表，按最后一条消息倒序 */
export function getDirectConversations(req: Types.GetDirectConversations.Request) {
  return invokeHub<Types.GetDirectConversations.Response>('GetDirectConversations', req)
}

/** 与某人的私信记录，Items 时间正序 */
export function getDirectMessages(req: Types.GetDirectMessages.Request) {
  return invokeHub<Types.GetDirectMessages.Response>('GetDirectMessages', req)
}

/** 发送私信，同一 ClientMessageId 重复发送返回原消息 */
export function sendDirectMessage(req: Types.SendDirectMessage.Request) {
  return invokeHub<Types.SendDirectMessage.Response>('SendDirectMessage', req)
}

/** 把与某人的会话读到指定消息为止 */
export function markDirectMessagesRead(req: Types.MarkDirectMessagesRead.Request) {
  return invokeHub<Types.MarkDirectMessagesRead.Response>('MarkDirectMessagesRead', req)
}

/** 拉黑或取消拉黑某人 */
export function setDirectMessageBlock(req: Types.SetDirectMessageBlock.Request) {
  return invokeHub<Types.SetDirectMessageBlock.Response>('SetDirectMessageBlock', req)
}
