import dayjs, { Dayjs } from 'dayjs'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { parseTime, toNow } from 'src/utils/time'

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
 * const lastUpdateTimeSourceRef = computed(() => book.value.LastUpdateTime)
 * const lastUpdateTime = useToNow(lastUpdateTimeSourceRef)
 *
 * // 这样合起来写也行↓
 * // const lastUpdateTime = useToNow(() => book.value.LastUpdateTime)
 *
 * return { lastUpdateTime }
 * ```
 */
export function useToNowRef(dateGetter: MaybeRefOrGetter<Date | Dayjs | undefined | null>): ComputedRef<string> {
  const dateRef = computed<Dayjs | null>(() => {
    const dateVal = toValue(dateGetter)
    if (!dateVal) {
      return null
    }

    return parseTime(dateVal)
  })

  const nowRef = shallowRef(dayjs())
  // 刷新nowRef
  watchEffect((onClean) => {
    const date = unref(dateRef)
    const now = unref(nowRef)

    // 不是同一天的就不更新了
    if (!date || !date.isSame(now, 'day')) {
      return
    }

    // 秒级别的差异，每半分钟刷新一次
    // => "x秒前"
    if (date.diff(now, 'second') < 60) {
      const timeout = setTimeout(() => {
        nowRef.value = dayjs()
      }, 1_000 * 1)

      onClean(() => clearTimeout(timeout))
      return
    }

    // 分钟级别的差异，每分钟刷新一次
    // => "x分钟前"
    if (date.diff(now, 'minute') < 60) {
      const timeout = setTimeout(() => {
        nowRef.value = dayjs()
      }, 1_000 * 60)
      onClean(() => clearTimeout(timeout))
      return
    }

    // 小时级别的差异，每半小时刷新一次
    // => "x小时前"
    const timeout = setTimeout(() => {
      nowRef.value = dayjs()
    }, 1_000 * 60 * 60)
    onClean(() => clearTimeout(timeout))
    return
  })

  return computed(() => {
    // console.log('re-calc toNow', dateRef.value.format(), nowRef.value.format())
    return dateRef.value ? toNow(dateRef.value, { now: nowRef.value }) : null
  })
}
