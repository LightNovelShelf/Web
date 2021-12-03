import '@/styles/quasar.scss'
import lang from 'quasar/lang/zh-CN.js'
import { Notify } from 'quasar'

export default {
  config: {
    dark: 'auto',
    screen: {
      bodyClasses: true
    },
    notify: {}
  },
  plugins: {
    Notify
  },
  lang: lang
}
