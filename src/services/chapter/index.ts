import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './types'

/** 获取章节内容信息 */
export function getNovelContent(request: Types.GetNovelContentRequest) {
  return requestWithSignalr('GetNovelContent', request)
}

export function updateNovelChapter(request: Types.UpdateNovelChapterRequest) {
  return requestWithSignalr('UpdateNovelChapter', request)
}

export function getNovelEditInfo(request: Types.UpdateNovelChapterRequest) {
  return requestWithSignalr('GetNovelEditInfo', request)
}

export function createNewNovelChapter(request: Types.UpdateNovelChapterRequest) {
  return requestWithSignalr('CreateNewNovelChapter', request)
}

export function deleteChapter(request: Types.UpdateNovelChapterRequest) {
  return requestWithSignalr('DeleteChapter', request)
}

export function reorderChapter(request: Types.ReorderChapterRequest) {
  return requestWithSignalr('ReorderChapter', request)
}
