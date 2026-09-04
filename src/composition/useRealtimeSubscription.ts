import { onUnmounted } from 'vue'

import { subscribeRealtime } from '@/services/transport/realtime'

export function useRealtimeSubscription<Response = unknown>(
  methodName: string,
  callback: (response: Response) => void,
): () => void {
  const unsubscribe = subscribeRealtime(methodName, callback)
  onUnmounted(unsubscribe)
  return unsubscribe
}
