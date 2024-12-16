import { defineBoot } from '#q-app/wrappers'
import { Dark, Quasar } from 'quasar'
import mdiIconSet from 'quasar/icon-set/svg-mdi-v7.js'

import { Dark as DarkSet } from 'src/utils/dark'

import * as myIcons from './quasar/icon'

export default defineBoot(() => {
  Dark.set(DarkSet.get())
  Quasar.iconSet.set(mdiIconSet)
  Quasar.iconSet.iconMapFn = (iconName) => {
    const icon = myIcons[iconName]
    if (icon !== undefined) {
      return { icon }
    }
  }
})
