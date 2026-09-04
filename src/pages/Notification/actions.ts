import type { GetNotifications } from '@/services/user/type'
import type { Router } from 'vue-router'

type NotificationActionHandler = (router: Router, data: Record<string, unknown>) => Promise<unknown>

const positiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null

const nonEmptyString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value : null

const actionHandlers: Record<string, NotificationActionHandler> = {
  open_book: async (router, data) => {
    const bookId = positiveInteger(data.book_id)
    if (bookId === null) return
    await router.push({ name: 'BookInfo', params: { bid: bookId } })
  },
  open_announcement: async (router, data) => {
    const announcementId = positiveInteger(data.announcement_id)
    if (announcementId === null) return
    await router.push({ name: 'AnnouncementDetail', params: { id: announcementId } })
  },
  open_series: async (router, data) => {
    const seriesTitle = nonEmptyString(data.series_title)
    if (seriesTitle === null) return
    await router.push({ name: 'MangaDetail', params: { seriesTitle } })
  },
  open_community_thread: async (router, data) => {
    const threadId = positiveInteger(data.thread_id)
    if (threadId === null) return

    const replyId = positiveInteger(data.reply_id)
    await router.push({
      name: 'ForumThread',
      params: { id: threadId },
      query: { replyId: replyId === null ? undefined : String(replyId) },
    })
  },
}

export const supportsNotificationAction = (action: GetNotifications.NotificationAction | null): boolean =>
  action !== null && actionHandlers[action.Type] !== undefined

export async function executeNotificationAction(
  router: Router,
  action: GetNotifications.NotificationAction | null,
): Promise<void> {
  if (action === null) return
  await actionHandlers[action.Type]?.(router, action.Data)
}
