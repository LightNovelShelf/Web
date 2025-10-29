import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './types'

/** 获取章节内容信息 */
export function getNovelContent(request: Types.GetNovelContentRequest) {
  return requestWithSignalr('GetNovelContent', request)
}

export function editChapterContent(request: Types.EditChapterContentRequest) {
  return requestWithSignalr('EditChapterContent', request)
}

export function getChapterEditInfo(request: Types.EditChapterContentRequest) {
  return requestWithSignalr('GetChapterEditInfo', request)
}

export function createNewChapter(request: Types.EditChapterContentRequest) {
  return requestWithSignalr('CreateNewChapter', request)
}

export function deleteChapter(request: Types.EditChapterContentRequest) {
  return requestWithSignalr('DeleteChapter', request)
}

export function changeChapterSort(request: Types.ChangeChapterSortRequest) {
  return requestWithSignalr('ChangeChapterSort', request)
}
