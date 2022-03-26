import { useToNow } from 'src/composition/useToNow'
import { computed, Ref } from 'vue'
import sanitizerHtml from 'src/utils/sanitizeHtml'
import { DateTime } from 'luxon'
import { parseTime } from 'src/utils/time'

export interface Announcement {
  Id: number
  Title: string
  Create: DateTime
  Before: Ref<string>
  Content: string
  PreviewContent: string
}

function getPreview(html: string): string {
  let div = document.createElement('div')
  div.innerHTML = sanitizerHtml(html)
  const text = div.textContent.trim()
  div = null
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

export function announcementFormat(element): Announcement {
  return {
    Id: element.Id,
    Create: parseTime(element.CreateTime),
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
