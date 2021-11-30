import { DateTime } from 'luxon'

/** 解析时间 */
export function parseTime(date: Date | DateTime): DateTime {
  if (DateTime.isDateTime(date)) {
    return date
  }

  return DateTime.fromJSDate(date)
}

/** 获取时间相对目前的文案描述 */
export function toNow(date: Date | DateTime, base?: DateTime, locale?: string): string {
  return parseTime(date).toRelative({ locale, base }) ?? 'invalid_date'
}
