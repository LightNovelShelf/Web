import { requestWithSignalr } from 'src/services/internal/request'

import * as Types from './types'

/** 获取章节内容信息 */
export function getChapterContent(request: Types.GetChapterContentRequest) {
  return requestWithSignalr('GetChapterContentBinary', request)
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

export function deleteChapter(request: Types.DeleteChapterRequest) {
  return requestWithSignalr('DeleteChapter', request)
}

export function changeChapterSort(request: Types.ChangeChapterSortRequest) {
  return requestWithSignalr('ChangeChapterSort', request)
}
