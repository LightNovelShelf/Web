import { defineAsyncComponent } from 'vue'

export const HtmlEditor = defineAsyncComponent(() => import('./html/HtmlEditor.vue'))
export const Comment = defineAsyncComponent(() => import('./Comment.vue'))
export const BlurHash = defineAsyncComponent(() => import('./BlurHash.vue'))
export const TelegramLoginTemp = defineAsyncComponent(() => import('./TelegramLoginTemp.vue'))
export const DragPageSticky = defineAsyncComponent(() => import('./DragPageSticky.vue'))
