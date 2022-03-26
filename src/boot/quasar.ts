import { boot } from 'quasar/wrappers'
import { Dark, Quasar } from 'quasar'
import { Dark as DarkSet } from 'src/utils/dark'
import mdiIconSet from './quasar/iconSet'

export default boot(() => {
  Dark.set(DarkSet.get())
  Quasar.iconSet.set(mdiIconSet)
})
