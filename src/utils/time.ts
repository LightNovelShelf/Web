import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

/**
 * 解析时间
 *
 * @param date 接受js时间对象、ISO字符串、luxon对象
 */
export function parseTime(date: Date | Dayjs | string): Dayjs {
  return dayjs(date)
}

/** 获取时间相对目前的文案描述 */
export function toNow(
  date: Date | Dayjs,
  config: {
    base?: Dayjs
    locale?: string
    notNegative?: boolean
  } = {
    notNegative: true
  }
): string {
  const { base, locale, notNegative } = config
  if (notNegative && parseTime(date).isAfter(dayjs())) {
    return '刚刚'
  }

  return parseTime(date).to(base)
}
