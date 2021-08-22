import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import { App } from '@vue/runtime-core'

export default function installElementPlus(app: App) {
  app.use(ElementPlus)
}
