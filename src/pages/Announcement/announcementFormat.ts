import sanitizerHtml from '@/utils/sanitizeHtml'
import { parseTime } from '@/utils/time'

import type { Announcement as _Announcement } from '@/services/context/type'
import type { Dayjs } from 'dayjs'

export interface Announcement {
  Id: number
  Title: string
  CreatedAt: Dayjs
  Content: string
  PreviewContent: string
}

function getPreview(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = sanitizerHtml(html)
  const text = div.textContent!.trim()
  div.remove()
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

export function announcementFormat(element: _Announcement): Announcement {
  return {
    Id: element.Id,
    CreatedAt: parseTime(element.CreatedAt),
    PreviewContent: getPreview(element.Content),
    Content: element.Content,
    Title: element.Title,
  }
}

export function announcementListFormat(announcementList: _Announcement[]): Announcement[] {
  const re: Announcement[] = []
  announcementList.forEach((element) => {
    re.push(announcementFormat(element))
  })
  return re
}
