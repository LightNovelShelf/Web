import { boot } from 'quasar/wrappers'

import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.min.css'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(Viewer, {
    defaultOptions: {
      navbar: false
    }
  })
})
