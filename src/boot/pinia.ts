import { boot } from 'quasar/wrappers'
import { createPiniaLoading } from './pinia/piniaLoading'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ store }) => {
  store.use(createPiniaLoading())
})
