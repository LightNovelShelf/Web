import { invokeHub } from '@/services/transport'

import type * as Types from './types'

/** 获取章节内容信息 */
export function getNovelContent(request: Types.GetNovelContentRequest) {
  return invokeHub<Types.GetNovelContentResponse>('GetNovelContent', request)
}

export function updateNovelChapter(request: Types.UpdateNovelChapterRequest) {
  return invokeHub('UpdateNovelChapter', request)
}

export function getNovelEditInfo(request: Types.GetNovelEditInfo) {
  return invokeHub<Types.ChapterEditState>('GetNovelEditInfo', request)
}

export function createNewNovelChapter(request: Types.UpdateNovelChapterRequest) {
  return invokeHub<Types.CreateChapterResponse>('CreateNewNovelChapter', request)
}

export function getComicEditInfo(request: Types.GetComicEditInfo) {
  return invokeHub<Types.ChapterEditState>('GetComicEditInfo', request)
}

export function updateComicChapter(request: Types.UpdateComicChapterRequest) {
  return invokeHub('UpdateComicChapter', request)
}

export function createNewComicChapter(request: Types.CreateNewComicChapterRequest) {
  return invokeHub<Types.CreateChapterResponse>('CreateNewComicChapter', request)
}

export function deleteChapter(request: Types.UpdateNovelChapterRequest) {
  return invokeHub<Types.ChapterInfo[]>('DeleteChapter', request)
}

export function reorderChapter(request: Types.ReorderChapterRequest) {
  return invokeHub<Types.ChapterInfo[]>('ReorderChapter', request)
}
