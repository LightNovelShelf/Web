import '@/styles/quasar.scss'
import lang from 'quasar/lang/zh-CN.js'
import { Notify, LoadingBar } from 'quasar'

export default {
  config: {
    dark: 'auto',
    screen: {
      bodyClasses: true
    },
    notify: {},
    LoadingBar: {
      skipHijack: true
    }
  },
  plugins: {
    Notify,
    LoadingBar
  },
  lang: lang
}
