import { requestWithSignalr } from '@/services/internal/request'

/** 获取章节内容信息 */
export function getChapterContent(bid: number, sortNum) {
  return requestWithSignalr('GetChapterContent', bid, sortNum)
}
