import { useQuasar } from 'quasar'

import sanitizerHtml from '@/utils/sanitizeHtml'

import { useSessionStore } from '@/stores/session'

import { useRealtimeSubscription } from '@/composition/useRealtimeSubscription'

import { NOOP } from '@/const/empty'

import type { Growth } from '@/services/points'

export function useServerNotifications(): void {
  const quasar = useQuasar()
  const sessionStore = useSessionStore()

  const notifyMessage = (message: string, type?: 'negative' | 'positive') => {
    quasar.notify({
      position: 'top',
      html: true,
      type,
      message: sanitizerHtml(message),
      timeout: 5_000,
      actions: [{ label: '关闭', color: 'white', handler: NOOP }],
    })
  }

  useRealtimeSubscription<string>('OnMessage', (message) => notifyMessage(message))
  useRealtimeSubscription<string>('OnError', (message) => notifyMessage(message, 'negative'))
  useRealtimeSubscription<string>('OnSuccess', (message) => notifyMessage(message, 'positive'))
  useRealtimeSubscription('OnNotificationRefresh', () => {
    void sessionStore.refreshUser().catch(NOOP)
  })
  useRealtimeSubscription<Growth>('OnGrowthUpdate', (growth) => {
    if (!growth) return

    const delta = sessionStore.applyGrowth(growth)
    if (!delta) return

    const parts: string[] = []
    if (delta.expDelta !== 0) parts.push(`经验 ${delta.expDelta > 0 ? '+' : ''}${delta.expDelta}`)
    if (delta.coinDelta !== 0) parts.push(`金币 ${delta.coinDelta > 0 ? '+' : ''}${delta.coinDelta}`)
    if (parts.length === 0) return

    quasar.notify({
      position: 'top',
      type: delta.expDelta < 0 || delta.coinDelta < 0 ? 'warning' : 'positive',
      message: parts.join('，'),
      timeout: 2_000,
    })
  })
}
