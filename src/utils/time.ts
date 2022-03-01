import { DateTime } from 'luxon'

/**
 * 解析时间
 *
 * @param date 接受js时间对象、ISO字符串、luxon对象
 */
export function parseTime(date: Date | DateTime | string): DateTime {
  if (DateTime.isDateTime(date)) {
    return date
  }

  if (typeof date === 'string') {
    return DateTime.fromISO(date)
  }

  return DateTime.fromJSDate(date)
}

/** 获取时间相对目前的文案描述 */
export function toNow(
  date: Date | DateTime,
  {
    base,
    locale,
    notNegative = true
  }: {
    base?: DateTime
    locale?: string
    notNegative?: boolean
  }
): string {
  let result = parseTime(date).toRelative({ base, locale })
  if (result) {
    if (notNegative && result.includes('后')) {
      result = '刚刚'
    }
  } else {
    return 'invalid_date'
  }
  return result
}
