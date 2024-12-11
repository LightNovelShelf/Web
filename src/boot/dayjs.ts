import { defineBoot } from '#q-app/wrappers'

import dayjs from 'dayjs'
import zh from 'dayjs/locale/zh'

import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

export default defineBoot(() => {
  dayjs.extend(relativeTime)
  dayjs.extend(isSameOrAfter)
  dayjs.extend(updateLocale)

  dayjs.locale(zh)
  dayjs.updateLocale(zh.name, { relativeTime: { ...zh.relativeTime, s: '%d秒' } })
})
