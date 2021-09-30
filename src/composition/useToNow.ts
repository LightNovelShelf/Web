import { DateTime } from 'luxon'
import { ref, Ref, ComputedRef } from 'vue'
import { parseTime, toNow } from '@/utils/time'
import { useTickSource } from './useTickSource'

/**
 * 返回一个定时刷新的 'xx天前' 文案
 *
 * @example
 * ```ts
 * const book = ref<{ LastUpdateTime: Date }>({ LastUpdateTime: new Date() })
 * onMounted(async () => {
 *   Promise.resolve().then(() => {
 *     book.value.LastUpdateTime = new Date()
 *   })
 * })
 *
 * const lastUpdateTimeSource = computed(() => book.value.LastUpdateTime)
 * const lastUpdateTime = useToNow(lastUpdateTimeSource)
 *
 * // 这样合起来写也行↓
 * // const lastUpdateTime = useToNow(computed(() => book.value.LastUpdateTime))
 *
 * return { lastUpdateTime }
 * ```
 */
export function useToNow(date: ComputedRef<Date | DateTime>, locale?: string): Ref<string> {
  const formated = ref('')

  useTickSource(() => {
    const dateObj = parseTime(date.value)
    formated.value = toNow(dateObj, locale)
  })

  return formated
}
