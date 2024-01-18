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

  /**
   * 最后一次更新 nowRef 对应的 dateRef 值
   *
   * @description
   * 新增这个值的用意是应对vue的组件复用；
   * 复用的组件不会重新跑setup也就不会重新构建nowRef，
   * 导致会出现前一帧时间还在正常更新，下一帧来了新的dateRef，与缓存中的nowRef去进行toNow调用了
   */
  const lastDateRef = shallowRef<Dayjs | null>(unref(dateRef))
  const nowRef = shallowRef(dayjs())

  function refreshNowRef() {
    nowRef.value = dayjs()
    // 更新 nowRef 时也更新 lastDateRef
    // 直接赋值同一个对象，免掉对象内存申请
    lastDateRef.value = dateRef.value
  }

  // 刷新nowRef
  watchEffect((onClean) => {
    if (
      // 如果date传进来是空值，保证一次 nowRef 是最新的
      // 防止now是几千年前存下来的值
      !unref(dateRef) ||
      // 如果date和lastDate不同，更新一次nowRef
      // 防止now是几个小时前的值但新的date是个几分钟的值，变相出现未来值了
      // 这里故意使用引用全等，意在强调 lastDate 与 date 是公用一份内存（/一个对象）的
      unref(dateRef) !== unref(lastDateRef)
    ) {
      refreshNowRef()
    }

    // 注意先更新，后取值
    const date = unref(dateRef)
    const now = unref(nowRef)

    if (
      // 如果date传进来是空值，无需定时刷新
      // 无效时间无需刷新
      !date ||
      // 如果date跟现在不在同一天，不刷了，爱咋咋滴
      !date.isSame(now, 'day')
    ) {
      return
    }

    // 秒级别的差异，每秒刷新一次
    // => "x秒前"
    if (date.diff(now, 'second') < 60) {
      const timeout = setTimeout(refreshNowRef, 1_000 * 1)

      onClean(() => clearTimeout(timeout))
      return
    }

    // 分钟级别的差异，每分钟刷新一次
    // => "x分钟前"
    if (date.diff(now, 'minute') < 60) {
      const timeout = setTimeout(refreshNowRef, 1_000 * 60)
      onClean(() => clearTimeout(timeout))
      return
    }

    // 小时级别的差异，每半小时刷新一次
    // => "x小时前"
    const timeout = setTimeout(refreshNowRef, 1_000 * 60 * 30)
    onClean(() => clearTimeout(timeout))
    return
  })

  return computed(() => {
    // console.log('re-calc toNow', dateRef.value.format(), nowRef.value.format())
    return dateRef.value ? toNow(dateRef.value, { now: nowRef.value, notNegative: true }) : null
  })
}
