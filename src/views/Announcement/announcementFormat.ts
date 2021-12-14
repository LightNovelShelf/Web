import { useToNow } from '@/composition/useToNow'
import { computed, Ref } from 'vue'

function matchReg(str: string): string {
  const reg = /<\/?.+?\/?>/g
  return str.replace(reg, '')
}

export function announcementFormat(element): any {
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

export function announcementListFormat(announcementList): any {
  const re: any[] = []
  announcementList.forEach((element) => {
    re.push(announcementFormat(element))
  })
  return re
}
