/** 私信相关接口类型；字段为 PascalCase，直接映射后端返回 */

/** 会话对方的用户摘要 */
export interface DirectMessagePeer {
  Id: number
  UserName: string
  Avatar: string
  /** 对方已注销，不能再发消息 */
  IsDeleted: boolean
}

/** 单条私信 */
export interface DirectMessageItem {
  Id: number
  /** 发送方生成的 uuid，用于幂等与本地 pending 消息对齐 */
  ClientMessageId: string
  SenderId: number
  Content: string
  CreatedAt: string
}

/** 会话列表项 */
export interface DirectConversationItem {
  Peer: DirectMessagePeer
  LastMessage: DirectMessageItem
  UnreadCount: number
  /** 0 表示对方还没读过任何消息 */
  PeerLastReadMessageId: number
  IsBlockedByMe: boolean
  CanSend: boolean
}

/**
 * 实时推送走 MessagePack，时间字段解出来是 Date；invokeHub 响应走 JSON，是 ISO 字符串。
 * store 入库前统一归一成 ISO 字符串。
 */
export type RealtimeTime = string | Date

/** 实时推送里的私信，除时间字段外与 DirectMessageItem 一致 */
export type RealtimeDirectMessageItem = Omit<DirectMessageItem, 'CreatedAt'> & {
  CreatedAt: RealtimeTime
}

/** 收发双方所有连接都会收到；PeerId 永远是「相对我的对方」 */
export interface OnDirectMessagePayload {
  PeerId: number
  Message: RealtimeDirectMessageItem
}

/** 已读回执，不含未读数 */
export interface OnDirectMessageReadPayload {
  PeerId: number
  ReaderId: number
  ThroughMessageId: number
  ReadAt: RealtimeTime
}

/** 拉黑状态变更，只发给操作者自己的连接 */
export interface OnDirectMessageBlockChangedPayload {
  PeerId: number
  IsBlockedByMe: boolean
  CanSend: boolean
}

export namespace GetDirectConversations {
  export interface Request {
    /** 0 表示取最新一页 */
    BeforeMessageId: number
    /** 钳制到 1..100，默认 20 */
    Size: number
  }
  export interface Response {
    Items: DirectConversationItem[]
    HasMore: boolean
    NextBeforeMessageId: number
  }
}

export namespace GetDirectMessages {
  export interface Request {
    PeerUserId: number
    /** 0 表示取最新一页 */
    BeforeMessageId: number
    /** 钳制到 1..100，默认 30 */
    Size: number
  }
  export interface Response {
    Peer: DirectMessagePeer
    /** 时间正序 */
    Items: DirectMessageItem[]
    HasMore: boolean
    /** 取更早历史时传给 BeforeMessageId */
    NextBeforeMessageId: number
    MyLastReadMessageId: number
    PeerLastReadMessageId: number
    UnreadCount: number
    IsBlockedByMe: boolean
    CanSend: boolean
  }
}

export namespace SendDirectMessage {
  export interface Request {
    RecipientUserId: number
    /** uuid，重试必须复用原值 */
    ClientMessageId: string
    Content: string
  }
  export interface Response {
    Message: DirectMessageItem
    PeerLastReadMessageId: number
  }
}

export namespace MarkDirectMessagesRead {
  export interface Request {
    PeerUserId: number
    ThroughMessageId: number
  }
  export interface Response {
    MyLastReadMessageId: number
    UnreadCount: number
  }
}

export namespace SetDirectMessageBlock {
  export interface Request {
    UserId: number
    IsBlocked: boolean
  }
  export interface Response {
    IsBlockedByMe: boolean
    CanSend: boolean
  }
}
