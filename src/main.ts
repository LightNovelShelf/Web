import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style/main.scss'
import './registerServiceWorker'
import router from './router'
import { naive } from './plugins/naive-ui'

const app = createApp(App)
app.use(createPinia()).use(router).use(naive).mount('#app')
