import dayjs, { Dayjs } from 'dayjs'

/**
 * 解析时间
 *
 * @param date 接受js时间对象、ISO字符串、dayjs对象
 */
export function parseTime(date: Date | Dayjs | string | undefined | null): Dayjs {
  // 字符串格式的时间戳会parse成错误的时间，但目前没有这种场景，先注释，省点
  // if (typeof date === 'string' && date === (+date).toString()) {
  //   date = +date
  // }

  return dayjs(date || 0)
}

/**
 * 获取时间相对目前的文案描述
 *
 * @url https://day.js.org/docs/en/display/from-now#list-of-breakdown-range
 */
export function toNow(
  date: Date | Dayjs,
  config: {
    now?: Dayjs
    notNegative?: boolean
  } = {
    notNegative: true
  }
): string {
  const { now = dayjs(), notNegative } = config
  const dateObj = parseTime(date)

  if (notNegative && dateObj.isSameOrAfter(now, 'second')) {
    return '刚刚'
  }

  return now.to(dateObj)
}
