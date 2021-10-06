import { Ref } from 'vue'

import { isConnected } from '@/services/internal/request'

/** 检查是否online（包括是否链接上了ws） */
export function useOnline(): Ref<boolean> {
  return isConnected
}
