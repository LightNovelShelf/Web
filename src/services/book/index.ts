import { requestWithSignalr } from '../internal/request'

import * as Types from './types'

/** 获取书籍列表 */
export function getBookList(page: number) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookList', page)
}
/** 获取书籍信息 */
export function getBookInfo(bid: number) {
  return requestWithSignalr<Types.GetBookInfoRes>('GetBookInfo', bid)
}
/** 获取章节内容信息 */
export function getChapterContent(bid: number, sortNum) {
  return requestWithSignalr('GetChapterContent', bid, sortNum)
}
