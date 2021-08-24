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
  NInput,
  NAvatar,
  NTooltip,
  NCascader,
  NCard,
  NGrid,
  NGi,
  NList,
  NListItem
} from 'naive-ui'
import 'vfonts/Roboto.css'
import { App } from '@vue/runtime-core'
import { HomeFilled, BookRound, ForumFilled, AnnouncementFilled, MessageFilled, InfoFilled } from '@vicons/material'

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
      NInput,
      NAvatar,
      NTooltip,
      NCascader,
      NCard,
      NGrid,
      NGi,
      NList,
      NListItem
    ]
  })
  app.use(naive)
}

export const icon = {
  HomeFilled,
  BookRound,
  ForumFilled,
  AnnouncementFilled,
  MessageFilled,
  InfoFilled
}
