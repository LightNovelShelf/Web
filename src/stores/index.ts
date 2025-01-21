import { defineStore } from '#q-app/wrappers'
import { createPinia } from 'pinia'

import { createPiniaLoading } from './plugin/piniaLoading'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia()

  pinia.use(createPiniaLoading())

  return pinia
})
