import { requestWithSignalr } from '@/services/internal/request'

import * as Types from './types'

/** 获取章节内容信息 */
export function getChapterContent(request: Types.GetChapterContentRequest) {
  return requestWithSignalr('GetChapterContent', request)
}
