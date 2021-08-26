import { createApp } from 'vue'
import App from './App.vue'
import './assets/style/main.scss'
import './registerServiceWorker'
import router from './router'
import store from './store'
import { naive } from './plugins/naive-ui'

const app = createApp(App)
app.use(store).use(router).use(naive).mount('#app')
