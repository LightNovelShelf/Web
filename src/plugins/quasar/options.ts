import '@/styles/quasar.scss'
import lang from 'quasar/lang/zh-CN.js'
import mdiIconSet from './iconSet'
import '@quasar/extras/roboto-font/roboto-font.css'
import { Notify, LoadingBar } from 'quasar'

export default {
  config: {
    dark: 'auto',
    screen: {
      bodyClasses: true
    },
    notify: {},
    loadingBar: {
      skipHijack: true
    }
  },
  iconSet: mdiIconSet,
  plugins: {
    Notify,
    LoadingBar
  },
  lang: lang
}
