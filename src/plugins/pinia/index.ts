import { createPinia } from 'pinia'
import { createPiniaLoading } from './piniaLoading'

export const pinia = createPinia()

pinia.use(createPiniaLoading())
