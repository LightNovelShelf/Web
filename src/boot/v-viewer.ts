import { defineBoot } from '#q-app/wrappers'
/* eslint-disable-next-line */
import Viewer from 'v-viewer'

export default defineBoot(({ app }) => {
  app.use(Viewer, {
    defaultOptions: {
      navbar: false,
    },
  })
})
