import {
  create,
  NButton,
  NConfigProvider,
  NH2,
  NLayout,
  NLayoutFooter,
  NLayoutSider,
  NLayoutHeader,
  NImage,
  NSpace
} from 'naive-ui'
import { App } from '@vue/runtime-core'

export default function installNaiveUI(app: App): void {
  const naive = create({
    components: [NButton, NConfigProvider, NH2, NLayout, NLayoutFooter, NLayoutSider, NLayoutHeader, NImage, NSpace]
  })
  app.use(naive)
}
