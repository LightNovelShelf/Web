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
      color: 'purple',
      size: '10px',
      position: 'top'
    }
  },
  plugins: {
    Notify,
    LoadingBar
  },
  lang: lang
}

LoadingBar.setDefaults({
  size: '2px',
  position: 'top'
})
