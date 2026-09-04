import { PATH } from '@/services/path'
import { invokeHub, requestHttp } from '@/services/transport'
import { RequestMethod } from '@/services/types'

import * as Types from './type'

import type { ShelfItem, SHELF_STRUCT_VER } from '@/types/shelf'
import type * as ShelfLegacyStruct from '@/utils/migrations/shelf/struct/types'

const publicSummaryCache = new Map<string, { expiresAt: number; value: Types.PublicUserSummary }>()
const publicSummaryRequests = new Map<string, Promise<Types.PublicUserSummary>>()
const PUBLIC_SUMMARY_CACHE_DURATION_MS = 5 * 60 * 1_000

export function getMyInfo(): Promise<Types.CurrentUser> {
  return invokeHub<Types.CurrentUser>('GetMyInfo')
}

export function getPublicUserSummary(id: number): Promise<Types.PublicUserSummary> {
  const key = `${PATH.USER_PUBLIC_SUMMARY}:${id}`
  const cached = publicSummaryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value)

  const pending = publicSummaryRequests.get(key)
  if (pending) return pending

  const request = requestHttp<Types.PublicUserSummary, { id: number }>(PATH.USER_PUBLIC_SUMMARY, {
    method: RequestMethod.GET,
    payload: { id },
  })
    .then((value) => {
      publicSummaryCache.set(key, { expiresAt: Date.now() + PUBLIC_SUMMARY_CACHE_DURATION_MS, value })
      return value
    })
    .finally(() => publicSummaryRequests.delete(key))

  publicSummaryRequests.set(key, request)
  return request
}

export function resetInviteCode() {
  return invokeHub<Types.ResetInviteCode.Res>('ResetInviteCode')
}

export function getReadHistory() {
  return invokeHub<{ Novel: number[]; Comic: number[] }>('GetReadHistory')
}

export function saveBookShelf(json: { data: ShelfItem[]; ver: SHELF_STRUCT_VER }) {
  return invokeHub('SaveBookShelf', json)
}

export function getBookShelfBinary() {
  return invokeHub<{
    data: (ShelfItem | ShelfLegacyStruct.ServerShelfItem)[]
    ver?: SHELF_STRUCT_VER
  }>('GetBookShelf')
}

export function clearHistory() {
  return invokeHub('ClearReadHistory')
}

export function setAvatar(url: string) {
  return invokeHub('SetAvatar', { Url: url })
}

export function getMyBooks(request: Types.GetMyBooks.Request) {
  return invokeHub<Types.GetMyBooks.Response>('GetMyBooks', request)
}

export function quickCreateNovel(request: Types.QuickCreateNovel.Request) {
  return invokeHub<Types.QuickCreateNovel.Response>('QuickCreateNovel', request)
}

export function quickCreateComic(request: Types.QuickCreateComic.Request) {
  return invokeHub<Types.QuickCreateComic.Response>('QuickCreateComic', request)
}

export function uploadImage(request: Types.UploadImage.Request) {
  return invokeHub<Types.UploadImage.Response>('UploadImage', request)
}

export function getNotifications(request: Types.GetNotifications.Request) {
  return invokeHub<Types.GetNotifications.Response>('GetNotifications', request)
}

export function markNotifications(request: Types.MarkNotifications.Request) {
  return invokeHub<Types.MarkNotifications.Response>('MarkNotifications', request)
}

export { Types as UserServiceTypes }
