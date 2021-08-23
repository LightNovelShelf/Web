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
  NSpace,
  NMenu,
  NIcon,
  NInput
} from 'naive-ui'
import { App } from '@vue/runtime-core'
import 'vfonts/Roboto.css'

export default function installNaiveUI(app: App): void {
  const naive = create({
    components: [
      NButton,
      NConfigProvider,
      NH2,
      NLayout,
      NLayoutFooter,
      NLayoutSider,
      NLayoutHeader,
      NImage,
      NSpace,
      NMenu,
      NIcon,
      NInput
    ]
  })
  app.use(naive)
}
