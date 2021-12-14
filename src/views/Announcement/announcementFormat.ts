import { useToNow } from '@/composition/useToNow'
import { computed, Ref } from 'vue'

export interface Announcement {
  Id: number
  Title: string
  CreateTime: DateConstructor
  Create: string
  Before: Ref<string>
  Content: string
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
  ele.Content = matchReg(element.Content)
  ele.Content = ele.Content.length > 50 ? ele.Content.substring(0, 50) + '...' : ele.Content
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
