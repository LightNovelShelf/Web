import { Dark, Quasar } from 'quasar'
import mdiIconSet from 'quasar/icon-set/svg-mdi-v7.js'

import { Dark as DarkSet } from '@/utils/dark'

import { defineBoot } from '#q-app'

import * as myIcons from './quasar/icon'

/** 图标名 -> svg path，运行时按名字动态取用 */
const iconMap: Record<string, string | undefined> = myIcons

export default defineBoot(() => {
  Dark.set(DarkSet.get())
  Quasar.iconSet.set(mdiIconSet)
  Quasar.iconSet.iconMapFn = (iconName) => {
    const icon = iconMap[iconName]
    if (icon !== undefined) {
      return { icon }
    }
  }
})
