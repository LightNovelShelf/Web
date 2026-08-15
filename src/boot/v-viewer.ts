import Viewer from 'v-viewer'

import { defineBoot } from '#q-app'

export default defineBoot(({ app }) => {
  app.use(Viewer, {
    defaultOptions: {
      navbar: false,
    },
  })
})
