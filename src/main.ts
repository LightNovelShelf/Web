import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style/main.scss'
import './registerServiceWorker'
import router from './router'
import { Quasar, Dark } from 'quasar'
import quasarUserOptions from '@/plugins/quasar/options'
import { QGridItem, QGrid } from '@/plugins/quasar/components'

const app = createApp(App)
app.component('q-grid', QGrid)
app.component('q-grid-item', QGridItem)

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
app.use(Viewer, {
  defaultOptions: {
    navbar: false
  }
})

app.use(createPinia()).use(router).use(Quasar, quasarUserOptions).mount('#app')

export default app
