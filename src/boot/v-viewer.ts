import { defineBoot } from '#q-app/wrappers'
import Viewer from 'v-viewer'

export default defineBoot(({ app }) => {
  app.use(Viewer, {
    defaultOptions: {
      navbar: false,
    },
  })
})
