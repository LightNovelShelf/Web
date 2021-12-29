import { defineAsyncComponent } from 'vue'

export const Comment = defineAsyncComponent(() => import('./Comment.vue'))
