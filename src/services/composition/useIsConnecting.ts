import { computed, Ref } from 'vue'

import { connectPromise } from '@/services/internal/request/signalr'

/**
 * 检查是否在重连
 *
 * @description
 * 就算只是re-export，这里也有保留的意义
 * 通过这个hook，可以屏蔽 internal 层的细节，方便改动解耦
 */
export function useIsConnecting(): Ref<boolean> {
  return computed(() => !!connectPromise.value)
}
