import { DateTime } from 'luxon'

/** 解析发现无效时间时返回0；方便做debug同时避免运行时错误（无效时间在不同场景下均可能会有意外的行为） */
const FALLBACK_TIME = DateTime.fromMillis(0)
/** 格式化时发现无效时间时返回 invalid_date */
const FALLBACK_TIME_FORMAT_RESULT = 'invalid_date'

/**
 * 时间解析
 *
 * 遇到不正确（null）、不支持的格式（2021年9月30日 GMT+8 下午5:19）就返回 DEFAULT_TIME
 *
 * 支持：
 * 1. 数字 - 时间戳
 * 2. 字符串 - 字符串类型的时间戳
 * 3. 字符串 - 2021-09-26 18:35 SQL样式
 * 4. 字符串 - 2021-09-26T18:35 等符合 iso-8601 标准的样式
 */
export function parseTime(time: string | number | null | undefined | Date): DateTime {
  let parsed = FALLBACK_TIME
  if (time === null || time === undefined) {
    return parsed
  }

  if (time instanceof Date) {
    // 目前书架用的websocket + msgpack 协议，返回的是 Date 实例
    parsed = DateTime.fromJSDate(time)
  } else if (typeof time === 'number' || time === `${+time}`) {
    parsed = DateTime.fromMillis(+time)
  } else {
    // 老的书架都是SQL样式: 2021-09-26 18:35
    parsed = DateTime.fromSQL(time)

    if (!parsed.isValid) {
      // 尝试用ISO再解一次
      parsed = DateTime.fromISO(time)
    }
  }

  // 如果还是无效，就按照 null/undefined 这类无效的逻辑来处理
  if (!parsed.isValid) {
    parsed = FALLBACK_TIME
  }

  return parsed
}

/**
 * 格式化时间
 *
 * @example
 * formatTime(DateTime.now()) // 2021-09-30 17:37:39, 默认就是SQL样式
 * formatTime(DateTime.now(), formatTime.FORMAT_TO_SQL) // 2021-09-30 17:37:39
 * formatTime(DateTime.now(), formatTime.FORMAT_TO_LOCAL) // 2021年9月30日 GMT+8 下午5:19
 * formatTime(DateTime.now(), 'yyyy-MM-dd HH:mm:ss') // 2021-09-30 17:37:39
 * formatTime(DateTime.now(), 'yyyy-MM-dd hh:mm:ss a', 'zh-TW') // 2021-09-30 05:37:39 下午
 */
export function formatTime(
  time: DateTime,
  tmpl: TimeFormatType | string = TimeFormatType.SQL,
  /** 不填的话根据用户浏览器语言进行本地化 */
  locale?: string
): string {
  if (!time.isValid) {
    // DateTime无效的情况下luxon返回null，与类型标注不符；这里提前处理
    return FALLBACK_TIME_FORMAT_RESULT
  }

  if (locale) {
    time = time.setLocale(locale)
  }

  switch (tmpl) {
    case formatTime.FORMAT_TO_SQL: {
      // 2021-09-30 17:37:39
      return time.toSQL({ includeOffset: false }).replace(/\.\d{0,3}$/, '')
    }
    case formatTime.FORMAT_TO_LOCAL: {
      // 2021年9月30日 GMT+8 下午5:19
      return time.toLocaleString(DateTime.DATETIME_FULL)
    }
    default: {
      return time.toFormat(tmpl)
    }
  }
}

enum TimeFormatType {
  SQL = 'SQL',
  LOCAL = 'LOCAL'
}

/** 格式化: 2021-09-30 17:37:39 @default */
formatTime.FORMAT_TO_SQL = TimeFormatType.SQL
/** 格式化: 2021年9月30日 GMT+8 下午5:19 */
formatTime.FORMAT_TO_LOCAL = TimeFormatType.LOCAL

/** 获取一个当前时间的对象 */
export function now(): DateTime {
  return DateTime.now()
}

/** 获取 "xx天前" 这类文案 */
export function toNow(time: DateTime, locale?: string): string {
  // 无效的时间会返回null，与类型标注不符
  return time.toRelative({ locale }) ?? FALLBACK_TIME_FORMAT_RESULT
}
