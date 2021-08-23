import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import installNaiveUI from './plugins/naiveUI'

const app = createApp(App)
installNaiveUI(app)
app.use(store).use(router).mount('#app')
