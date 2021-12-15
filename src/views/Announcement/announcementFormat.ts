import { useToNow } from '@/composition/useToNow'
import { computed, Ref } from 'vue'
import sanitizerHtml from '@/utils/sanitizeHtml'

export interface Announcement {
  Id: number
  Title: string
  Create: string
  Before: Ref<string>
  Content: string
  PreviewContent: string
}

function getPreview(html: string): string {
  let div = document.createElement('div')
  div.innerHTML = sanitizerHtml(html)
  const text = div.textContent
  div = null
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

export function announcementFormat(element): Announcement {
  return {
    Id: element.Id,
    Create:
      element.CreateTime.getFullYear() + '.' + (element.CreateTime.getMonth() + 1) + '.' + element.CreateTime.getDate(),
    Before: useToNow(computed(() => element.CreateTime)),
    PreviewContent: getPreview(element.Content),
    Content: element.Content,
    Title: element.Title
  }
}

export function announcementListFormat(announcementList): Announcement[] {
  const re: Announcement[] = []
  announcementList.forEach((element) => {
    re.push(announcementFormat(element))
  })
  return re
}
