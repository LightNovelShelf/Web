import { defineAsyncComponent } from 'vue'

export { default as Comment } from './Comment.vue'

export const htmlContent = defineAsyncComponent(() => import('./HtmlContent.vue'))
