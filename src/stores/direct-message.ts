import { defineStore } from 'pinia'

import { useSessionStore } from '@/stores/session'

import { NOOP } from '@/const/empty'
import {
  getDirectConversations,
  getDirectMessages,
  markDirectMessagesRead,
  sendDirectMessage,
  setDirectMessageBlock,
} from '@/services/direct-message'

import type {
  DirectConversationItem,
  DirectMessageItem,
  DirectMessagePeer,
  OnDirectMessageBlockChangedPayload,
  OnDirectMessagePayload,
  OnDirectMessageReadPayload,
  RealtimeTime,
} from '@/services/direct-message/type'

const CONVERSATION_PAGE_SIZE = 20
const MESSAGE_PAGE_SIZE = 30
const CALIBRATE_DEBOUNCE_MS = 400

/** 本地待发送消息，服务端确认后从 pending 移除 */
export interface PendingMessage {
  ClientMessageId: string
  Content: string
  CreatedAt: string
  status: 'pending' | 'failed'
}

/** 单个会话的完整前端状态 */
export interface ChatState {
  peer: DirectMessagePeer | null
  /** 时间正序，按 Id 去重 */
  messages: DirectMessageItem[]
  pending: PendingMessage[]
  hasMore: boolean
  nextBeforeMessageId: number
  myLastReadMessageId: number
  peerLastReadMessageId: number
  unreadCount: number
  isBlockedByMe: boolean
  canSend: boolean
  loaded: boolean
}

/** 每个 peerId 一条发送队列，链式 await 保证同一会话按点击顺序提交 */
const sendQueues = new Map<number, Promise<unknown>>()

let calibrateTimer: ReturnType<typeof setTimeout> | undefined
let calibrateRunning = false
/** 校准进行中又收到事件，跑完当前轮再补一轮 */
let calibrateDirty = false

function createChatState(): ChatState {
  return {
    peer: null,
    messages: [],
    pending: [],
    hasMore: false,
    nextBeforeMessageId: 0,
    myLastReadMessageId: 0,
    peerLastReadMessageId: 0,
    unreadCount: 0,
    isBlockedByMe: false,
    canSend: true,
    loaded: false,
  }
}

/** MessagePack 推送里的时间是 Date，JSON 响应里是 ISO 字符串，统一成后者 */
function toIsoTime(value: RealtimeTime): string {
  return typeof value === 'string' ? value : new Date(value).toISOString()
}

/** 服务端按 \r\n → \n 后 trim 规范化，本地 pending 用同样规则，重发才能命中幂等 */
function normalizeContent(content: string): string {
  return content.replace(/\r\n?/g, '\n').trim()
}

/**
 * 合并消息并保持 Id 升序。
 * 自己发的消息会先后从 SendDirectMessage 响应和 OnDirectMessage 推送到达，
 * 两条路径的 Id 相同，但推送可能早于响应，所以额外按 ClientMessageId 去重。
 */
function mergeMessages(target: DirectMessageItem[], incoming: DirectMessageItem[]): void {
  if (incoming.length === 0) return

  const indexById = new Map<number, number>()
  const indexByClientId = new Map<string, number>()
  for (let index = 0; index < target.length; index++) {
    const item = target[index]!
    indexById.set(item.Id, index)
    if (item.ClientMessageId) indexByClientId.set(item.ClientMessageId, index)
  }

  let appended = false
  for (const item of incoming) {
    const index = indexById.get(item.Id) ?? (item.ClientMessageId ? indexByClientId.get(item.ClientMessageId) : undefined)
    if (index === undefined) {
      indexById.set(item.Id, target.length)
      if (item.ClientMessageId) indexByClientId.set(item.ClientMessageId, target.length)
      target.push(item)
      appended = true
    } else {
      target[index] = item
    }
  }
  if (!appended) return

  for (let index = 1; index < target.length; index++) {
    if (target[index - 1]!.Id > target[index]!.Id) {
      target.sort((a, b) => a.Id - b.Id)
      return
    }
  }
}

/** 会话列表按最后一条消息倒序 */
function sortConversations(conversations: DirectConversationItem[]): void {
  conversations.sort((a, b) => b.LastMessage.Id - a.LastMessage.Id)
}

function mergeConversations(target: DirectConversationItem[], incoming: DirectConversationItem[]): void {
  if (incoming.length === 0) return

  const indexByPeer = new Map<number, number>()
  for (let index = 0; index < target.length; index++) indexByPeer.set(target[index]!.Peer.Id, index)

  for (const item of incoming) {
    const index = indexByPeer.get(item.Peer.Id)
    if (index === undefined) {
      indexByPeer.set(item.Peer.Id, target.length)
      target.push(item)
    } else {
      target[index] = item
    }
  }
  sortConversations(target)
}

function enqueueSend(peerId: number, task: () => Promise<void>): Promise<void> {
  const previous = sendQueues.get(peerId) ?? Promise.resolve()
  // 前一条失败也要继续跑后一条，否则整条队列会卡死
  const result = previous.then(task, task)
  const chained = result.catch(NOOP)
  sendQueues.set(peerId, chained)
  void chained.then(() => {
    if (sendQueues.get(peerId) === chained) sendQueues.delete(peerId)
  })
  return result
}

async function submitPending(
  peerId: number,
  chat: ChatState,
  clientMessageId: string,
  applyMessage: (payload: OnDirectMessagePayload) => void,
): Promise<void> {
  const pending = chat.pending.find((item) => item.ClientMessageId === clientMessageId)
  if (!pending) return

  pending.status = 'pending'
  try {
    const res = await sendDirectMessage({
      RecipientUserId: peerId,
      ClientMessageId: clientMessageId,
      Content: pending.Content,
    })
    const index = chat.pending.indexOf(pending)
    if (index >= 0) chat.pending.splice(index, 1)
    chat.peerLastReadMessageId = Math.max(chat.peerLastReadMessageId, res.PeerLastReadMessageId)
    applyMessage({ PeerId: peerId, Message: res.Message })
  } catch (error) {
    // 保留正文与原 ClientMessageId，重试复用同一个 uuid 命中服务端幂等
    pending.status = 'failed'
    throw error
  }
}

export const useDirectMessageStore = defineStore('app.directMessage', {
  state: () => ({
    /** 按 LastMessage.Id 倒序 */
    conversations: [] as DirectConversationItem[],
    conversationsHasMore: false,
    conversationsNextBeforeMessageId: 0,
    chats: {} as Record<number, ChatState>,
  }),
  getters: {
    chat: (state) => {
      return (peerId: number): ChatState | undefined => state.chats[peerId]
    },
  },
  actions: {
    ensureChat(peerId: number): ChatState {
      const existed = this.chats[peerId]
      if (existed) return existed

      this.chats[peerId] = createChatState()
      return this.chats[peerId]!
    },

    async loadConversations(): Promise<void> {
      const res = await getDirectConversations({ BeforeMessageId: 0, Size: CONVERSATION_PAGE_SIZE })
      this.conversations = res.Items
      this.conversationsHasMore = res.HasMore
      this.conversationsNextBeforeMessageId = res.NextBeforeMessageId

      // 列表里带着未读数和拉黑状态，顺手校准已加载的会话
      for (const item of res.Items) {
        const chat = this.chats[item.Peer.Id]
        if (!chat) continue
        chat.unreadCount = item.UnreadCount
        chat.peerLastReadMessageId = Math.max(chat.peerLastReadMessageId, item.PeerLastReadMessageId)
        chat.isBlockedByMe = item.IsBlockedByMe
        chat.canSend = item.CanSend
      }
    },

    async loadMoreConversations(): Promise<void> {
      if (!this.conversationsHasMore) return

      const res = await getDirectConversations({
        BeforeMessageId: this.conversationsNextBeforeMessageId,
        Size: CONVERSATION_PAGE_SIZE,
      })
      mergeConversations(this.conversations, res.Items)
      this.conversationsHasMore = res.HasMore
      this.conversationsNextBeforeMessageId = res.NextBeforeMessageId
    },

    async loadChat(peerId: number): Promise<void> {
      const chat = this.ensureChat(peerId)
      const res = await getDirectMessages({ PeerUserId: peerId, BeforeMessageId: 0, Size: MESSAGE_PAGE_SIZE })

      chat.peer = res.Peer
      chat.messages = res.Items
      chat.hasMore = res.HasMore
      chat.nextBeforeMessageId = res.NextBeforeMessageId
      chat.myLastReadMessageId = Math.max(chat.myLastReadMessageId, res.MyLastReadMessageId)
      chat.peerLastReadMessageId = Math.max(chat.peerLastReadMessageId, res.PeerLastReadMessageId)
      chat.unreadCount = res.UnreadCount
      chat.isBlockedByMe = res.IsBlockedByMe
      chat.canSend = res.CanSend
      chat.loaded = true
    },

    async loadOlderMessages(peerId: number): Promise<void> {
      const chat = this.chats[peerId]
      if (!chat || !chat.hasMore) return

      const res = await getDirectMessages({
        PeerUserId: peerId,
        BeforeMessageId: chat.nextBeforeMessageId,
        Size: MESSAGE_PAGE_SIZE,
      })
      chat.peer = res.Peer
      mergeMessages(chat.messages, res.Items)
      chat.hasMore = res.HasMore
      chat.nextBeforeMessageId = res.NextBeforeMessageId
    },

    async sendMessage(peerId: number, content: string): Promise<void> {
      const text = normalizeContent(content)
      if (!text) return

      const chat = this.ensureChat(peerId)
      const clientMessageId = crypto.randomUUID()
      chat.pending.push({
        ClientMessageId: clientMessageId,
        Content: text,
        CreatedAt: new Date().toISOString(),
        status: 'pending',
      })

      await enqueueSend(peerId, () =>
        submitPending(peerId, chat, clientMessageId, (payload) => this.applyIncomingMessage(payload)),
      )
    },

    async retryMessage(peerId: number, clientMessageId: string): Promise<void> {
      const chat = this.chats[peerId]
      if (!chat?.pending.some((item) => item.ClientMessageId === clientMessageId)) return

      await enqueueSend(peerId, () =>
        submitPending(peerId, chat, clientMessageId, (payload) => this.applyIncomingMessage(payload)),
      )
    },

    async markRead(peerId: number, throughMessageId: number): Promise<void> {
      const chat = this.ensureChat(peerId)
      if (throughMessageId <= 0 || throughMessageId <= chat.myLastReadMessageId) return

      const res = await markDirectMessagesRead({ PeerUserId: peerId, ThroughMessageId: throughMessageId })
      chat.myLastReadMessageId = Math.max(chat.myLastReadMessageId, res.MyLastReadMessageId)
      chat.unreadCount = res.UnreadCount

      const conversation = this.conversations.find((item) => item.Peer.Id === peerId)
      if (conversation) conversation.UnreadCount = res.UnreadCount

      this.calibrate()
    },

    async setBlock(peerId: number, isBlocked: boolean): Promise<void> {
      const chat = this.ensureChat(peerId)
      const res = await setDirectMessageBlock({ UserId: peerId, IsBlocked: isBlocked })
      chat.isBlockedByMe = res.IsBlockedByMe
      chat.canSend = res.CanSend

      const conversation = this.conversations.find((item) => item.Peer.Id === peerId)
      if (conversation) {
        conversation.IsBlockedByMe = res.IsBlockedByMe
        conversation.CanSend = res.CanSend
      }
    },

    applyIncomingMessage(payload: OnDirectMessagePayload): void {
      const peerId = payload.PeerId
      const message: DirectMessageItem = {
        ...payload.Message,
        CreatedAt: toIsoTime(payload.Message.CreatedAt),
      }

      const chat = this.chats[peerId]
      if (chat) {
        mergeMessages(chat.messages, [message])
        const index = chat.pending.findIndex((item) => item.ClientMessageId === message.ClientMessageId)
        if (index >= 0) chat.pending.splice(index, 1)
      }

      const conversation = this.conversations.find((item) => item.Peer.Id === peerId)
      if (conversation && message.Id > conversation.LastMessage.Id) {
        conversation.LastMessage = message
        sortConversations(this.conversations)
      }

      // 未读数与新会话本身由校准从服务端取回
      this.calibrate()
    },

    applyReadReceipt(payload: OnDirectMessageReadPayload): void {
      const isMine = payload.ReaderId === useSessionStore().userId
      const chat = this.chats[payload.PeerId]
      if (chat) {
        if (isMine) chat.myLastReadMessageId = Math.max(chat.myLastReadMessageId, payload.ThroughMessageId)
        else chat.peerLastReadMessageId = Math.max(chat.peerLastReadMessageId, payload.ThroughMessageId)
      }

      if (!isMine) {
        const conversation = this.conversations.find((item) => item.Peer.Id === payload.PeerId)
        if (conversation) {
          conversation.PeerLastReadMessageId = Math.max(conversation.PeerLastReadMessageId, payload.ThroughMessageId)
        }
        return
      }

      // 我在别的端读了消息，未读数只能重新问服务端
      this.calibrate()
    },

    applyBlockChanged(payload: OnDirectMessageBlockChangedPayload): void {
      const chat = this.chats[payload.PeerId]
      if (chat) {
        chat.isBlockedByMe = payload.IsBlockedByMe
        chat.canSend = payload.CanSend
      }

      const conversation = this.conversations.find((item) => item.Peer.Id === payload.PeerId)
      if (conversation) {
        conversation.IsBlockedByMe = payload.IsBlockedByMe
        conversation.CanSend = payload.CanSend
      }
    },

    calibrate(): void {
      clearTimeout(calibrateTimer)
      calibrateTimer = setTimeout(() => {
        calibrateTimer = undefined
        if (calibrateRunning) {
          calibrateDirty = true
          return
        }

        void (async () => {
          calibrateRunning = true
          try {
            do {
              // 先清标记再查询，保证至少有一次查询发生在最新事件之后
              calibrateDirty = false
              await Promise.all([this.loadConversations(), useSessionStore().refreshUser()]).catch(NOOP)
            } while (calibrateDirty)
          } finally {
            calibrateRunning = false
          }
        })()
      }, CALIBRATE_DEBOUNCE_MS)
    },

    async resync(): Promise<void> {
      const tasks: Promise<unknown>[] = [
        this.loadConversations().catch(NOOP),
        useSessionStore().refreshUser().catch(NOOP),
      ]

      for (const key of Object.keys(this.chats)) {
        const peerId = Number(key)
        const chat = this.chats[peerId]
        if (!chat?.loaded) continue

        tasks.push(
          getDirectMessages({ PeerUserId: peerId, BeforeMessageId: 0, Size: MESSAGE_PAGE_SIZE })
            .then((res) => {
              const wasEmpty = chat.messages.length === 0
              chat.peer = res.Peer
              mergeMessages(chat.messages, res.Items)
              // 已加载更早历史时，最新一页的分页游标会往回退，不能覆盖
              if (wasEmpty) {
                chat.hasMore = res.HasMore
                chat.nextBeforeMessageId = res.NextBeforeMessageId
              }
              chat.myLastReadMessageId = Math.max(chat.myLastReadMessageId, res.MyLastReadMessageId)
              chat.peerLastReadMessageId = Math.max(chat.peerLastReadMessageId, res.PeerLastReadMessageId)
              chat.unreadCount = res.UnreadCount
              chat.isBlockedByMe = res.IsBlockedByMe
              chat.canSend = res.CanSend
            })
            .catch(NOOP),
        )
      }

      await Promise.all(tasks)
    },

    reset(): void {
      clearTimeout(calibrateTimer)
      calibrateTimer = undefined
      calibrateDirty = false
      sendQueues.clear()

      this.conversations = []
      this.conversationsHasMore = false
      this.conversationsNextBeforeMessageId = 0
      this.chats = {}
    },
  },
})
