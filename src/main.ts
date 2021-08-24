import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import installNaiveUI from '@/plugins/naive-ui.ts'

const app = createApp(App)
installNaiveUI(app)
app.use(store).use(router).mount('#app')
