import { useToNow } from '@/composition/useToNow'
import { computed, Ref } from 'vue'

export interface Announcement {
  Id: number
  Title: string
  CreateTime: DateConstructor
  Create: string
  Before: Ref<string>
  Content: string
  PreviewContent: string
}

function matchReg(str: string): string {
  const reg = /<\/?.+?\/?>/g
  return str.replace(reg, '')
}

export function announcementFormat(element): Announcement {
  const ele: any = {}
  ele.Create =
    element.CreateTime.getFullYear() + '.' + (element.CreateTime.getMonth() + 1) + '.' + element.CreateTime.getDate()
  ele.Before = useToNow(computed(() => element.CreateTime))
  ele.PreviewContent = matchReg(element.Content)
  ele.Content = element.Content
  ele.PreviewContent = ele.PreviewContent.length > 50 ? ele.PreviewContent.substring(0, 50) + '...' : ele.PreviewContent
  ele.Title = element.Title
  ele.Id = element.Id
  return ele
}

export function announcementListFormat(announcementList): Announcement[] {
  const re: Announcement[] = []
  announcementList.forEach((element) => {
    re.push(announcementFormat(element))
  })
  return re
}
