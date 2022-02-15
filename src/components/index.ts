import { defineAsyncComponent } from 'vue'

export const HtmlEditor = defineAsyncComponent(() => import('./HtmlEditor.vue'))
export const Comment = defineAsyncComponent(() => import('./Comment.vue'))
