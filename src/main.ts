import { createPinia } from 'pinia'
import './assets/style/main.scss'
import './registerServiceWorker'
import router from './router'
import { Quasar, Dark } from 'quasar'
import quasarUserOptions from '@/plugins/quasar/options'
import { QGridItem, QGrid } from '@/plugins/quasar/components'
import { app } from './app'

app.component('q-grid', QGrid)
app.component('q-grid-item', QGridItem)
app.use(createPinia()).use(router).use(Quasar, quasarUserOptions).mount('#app')
