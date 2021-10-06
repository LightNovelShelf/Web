import { ref, Ref, onMounted, onBeforeUnmount } from 'vue'

import { signalrEvtEmiter } from '@/services/internal/request'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => {}

/** 检查是否online（包括是否链接上了ws） */
export function useOnline(): Ref<boolean> {
  const online = ref<boolean>(false)
  /** 清除监听 */
  const cleaner = ref<() => void>(NOOP)

  onMounted(() => {
    try {
      cleaner.value = signalrEvtEmiter.onStatusChange((connected) => (online.value = connected))
      online.value = signalrEvtEmiter.lastConnectedStatus()
    } catch (e) {
      /**  */
    }
  })

  onBeforeUnmount(() => cleaner.value())

  return online
}
