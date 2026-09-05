import { watch } from 'vue'

import { useDirectMessageStore } from '@/stores/direct-message'
import { useSessionStore } from '@/stores/session'

import { useRealtimeSubscription } from '@/composition/useRealtimeSubscription'

import { NOOP } from '@/const/empty'
import { isRealtimeConnected } from '@/services/transport'

import type {
  OnDirectMessageBlockChangedPayload,
  OnDirectMessagePayload,
  OnDirectMessageReadPayload,
} from '@/services/direct-message/type'

/** 全局订阅私信事件，不在私信页也要刷新未读数 */
export function useDirectMessageEvents(): void {
  const directMessageStore = useDirectMessageStore()
  const sessionStore = useSessionStore()

  useRealtimeSubscription<OnDirectMessagePayload>('OnDirectMessage', (payload) => {
    if (!payload) return
    directMessageStore.applyIncomingMessage(payload)
  })
  useRealtimeSubscription<OnDirectMessageReadPayload>('OnDirectMessageRead', (payload) => {
    if (!payload) return
    directMessageStore.applyReadReceipt(payload)
  })
  useRealtimeSubscription<OnDirectMessageBlockChangedPayload>('OnDirectMessageBlockChanged', (payload) => {
    if (!payload) return
    directMessageStore.applyBlockChanged(payload)
  })

  // 断线期间的消息不会补推，连上（含首次连上）就整体对一次账
  watch(
    isRealtimeConnected,
    (connected, previous) => {
      if (!connected || previous || !sessionStore.user) return
      void directMessageStore.resync().catch(NOOP)
    },
    { immediate: true },
  )
}
