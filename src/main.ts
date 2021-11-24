import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style/main.scss'
import './registerServiceWorker'
import router from './router'
import { naive } from './plugins/naive-ui'
import SvgIcon from '@/plugins/naive-ui/components/SvgIcon.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

const app = createApp(App).use(Quasar, quasarUserOptions)
app.component('svg-icon', SvgIcon)
app.use(createPinia()).use(router).use(naive).mount('#app')
