import { defineAsyncComponent } from 'vue'
export { default as UserAvatar } from './UserAvatar.vue'

export const HtmlEditor = defineAsyncComponent(() => import('./html/HtmlEditor.vue'))
export const Comment = defineAsyncComponent(() => import('./Comment.vue'))
export const TelegramLoginTemp = defineAsyncComponent(() => import('./TelegramLoginTemp.vue'))
export const DragPageSticky = defineAsyncComponent(() => import('./DragPageSticky.vue'))
export const ImageInput = defineAsyncComponent(() => import('./ImageInput.vue'))
export const ComicChapterImages = defineAsyncComponent(() => import('./ComicChapterImages.vue'))
