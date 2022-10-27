import { requestWithSignalr } from '../internal/request'

import * as Types from './types'
import { SaveReadPositionRequest } from './types'
export { Types as BookServicesTypes }

/** 获取书籍列表 */
export function getBookList(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookListBinary', param)
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
/** 最大并行数量 */
getBookListByIds.MAX_CONCURRENT = 24

/** 取最新的6本书，无需登录 */
export function getLatestBookList() {
  return requestWithSignalr<Types.GetBookListRes>('GetLatestBookListBinary')
}

/** 取最近的排行榜 */
export function getRank(days: number) {
  return requestWithSignalr<Types.BookInList[]>('GetRankBinary', days)
}

/** 编辑书籍信息 */
export function editBook(request: Types.EditBookRequest) {
  return requestWithSignalr('EditBook', request)
}

/** 取编辑用的书籍信息 */
export function getBookEditInfo(bid: number) {
  return requestWithSignalr('GetBookEditInfo', bid)
}

/** 删除书籍 */
export function deleteBook(bid: number) {
  return requestWithSignalr('DeleteBook', bid)
}

/** 设置书籍 */
export function setBookSetting(request: Types.SetBookSetting) {
  return requestWithSignalr('SetBookSetting', request)
}

export function getBookSetting(request: number) {
  return requestWithSignalr('GetBookSetting', request)
}
