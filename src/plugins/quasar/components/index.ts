import { defineAsyncComponent } from 'vue'

export const QGrid = defineAsyncComponent(() => import('./QGrid.vue'))
export const QGridItem = defineAsyncComponent(() => import('./QGridItem.vue'))
