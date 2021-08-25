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
  NListItem,
  NText,
  NRow,
  NCol,
  NStatistic,
  NEllipsis,
  NTag,
  NElement
} from 'naive-ui'
import 'vfonts/Roboto.css'
import {
  HomeFilled,
  BookRound,
  ForumFilled,
  AnnouncementFilled,
  MessageFilled,
  InfoFilled,
  KeyboardArrowRightFilled,
  SaveFilled
} from '@vicons/material'

export const icon = {
  HomeFilled,
  BookRound,
  ForumFilled,
  AnnouncementFilled,
  MessageFilled,
  InfoFilled,
  KeyboardArrowRightFilled,
  SaveFilled
}

const components = [
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
  NListItem,
  NText,
  NRow,
  NCol,
  NStatistic,
  NEllipsis,
  NTag,
  NElement
]

const naive = create({
  components: components
})

export default naive
