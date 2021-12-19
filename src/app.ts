import { createApp, defineAsyncComponent } from 'vue'

export const app = createApp(defineAsyncComponent(() => import('./App.vue')))
