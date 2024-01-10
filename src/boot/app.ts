import '../global'
import { boot } from 'quasar/wrappers'

let app = null

export default boot(({ app: _app }) => {
  app = _app
})

export { app }
