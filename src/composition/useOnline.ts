import { Ref } from 'vue'

import { isConnected } from '@/services/internal/request/signalr'

/**
 * 检查是否online（包括是否链接上了ws）
 *
 * @description
 * 就算只是re-export，这里也有保留的意义
 * 通过这个hook，可以屏蔽 internal 层的细节，方便改动解耦
 */
export function useOnline(): Ref<boolean> {
  return isConnected
}
