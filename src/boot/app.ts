import { defineBoot } from '#q-app'

let app = null

export default defineBoot(({ app: _app }) => {
  app = _app
})

export { app }
