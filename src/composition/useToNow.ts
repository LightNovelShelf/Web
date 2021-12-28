import { DateTime } from 'luxon'
import { computed, ComputedRef, ref, Ref } from 'vue'
import { parseTime, toNow } from '@/utils/time'
import { useTickSource } from '@/composition/useTickSource'

const baseTime = ref(DateTime.now())
useTickSource(() => {
  baseTime.value = DateTime.now()
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
export function useToNow(date: ComputedRef<Date | DateTime>, notNegative = true, locale?: string): Ref<string> {
  const dateObj = computed(() => parseTime(date.value))
  return computed(() => {
    const str = toNow(dateObj.value, baseTime.value, locale)
    return notNegative && str.includes('后') ? '刚刚' : str
  })
}

export { baseTime }
