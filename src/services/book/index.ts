import { requestWithSignalr } from '../internal/request'

import * as Types from './types'
import { SaveReadPositionRequest } from './types'
export { Types as BookServicesTypes }

/** 获取书籍列表 */
export function getBookList(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookList', param)
}
/** 获取书籍信息 */
export function getBookInfo(bid: number) {
  return requestWithSignalr<Types.GetBookInfoRes>('GetBookInfo', bid)
}
/** 保存阅读位置 */
export function saveReadPosition(param: SaveReadPositionRequest) {
  return requestWithSignalr('SaveReadPosition', param)
}
/** 获取阅读位置 */
export function getReadPosition(bid: number) {
  return requestWithSignalr('GetReadPosition', bid)
}
/** 从一批id获取书籍列表 */
export function getBookListByIds(ids: number[]) {
  // 校验数量，接口限制一次最多24本
  if (__DEV__) {
    if (ids.length > 24) {
      throw new Error('单次批量操作最多24本')
    }
  }
  return requestWithSignalr<Types.BookInList[]>('GetBookListByIds', ids)
}
/** 取最新的6本书，无需登录 */
export function getLatestBookList() {
  return requestWithSignalr<Types.GetBookListRes>('GetLatestBookList')
}
/** 取最近的排行榜 */
export function getRank(days: number) {
  return requestWithSignalr<Types.BookInList[]>('GetRank', days)
}
/** 编辑书籍信息 */
export function editBook(request: Types.EditBookRequest) {
  return requestWithSignalr('EditBook', request)
}
/** 取编辑用的书籍信息 */
export function getBookEditInfo(bid: number) {
  return requestWithSignalr('GetBookEditInfo', bid)
}
