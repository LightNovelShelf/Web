import { DateTime } from 'luxon'
import { computed, ComputedRef, ref, Ref } from 'vue'
import { parseTime, toNow } from '@/utils/time'
import { useTickSource } from '@/composition/useTickSource'

const base = ref(DateTime.now())
useTickSource(() => {
  base.value = DateTime.now()
})

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
  const dateObj = computed(() => parseTime(date.value))
  return computed(() => toNow(dateObj.value, base.value, locale))
}
