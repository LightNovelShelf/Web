import type { SaveReadPositionRequest } from './types'

import * as Types from './types'
import { requestWithSignalr } from '../internal/request'

export { Types as BookServicesTypes }

/** 获取书籍列表 */
export function getBookList(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookList', param)
}
/** 获取书籍信息 */
export function getBookInfo(id: number) {
  return requestWithSignalr<Types.GetBookInfoRes>('GetBookInfo', { Id: id })
}
/** 保存阅读位置 */
export function saveReadPosition(param: SaveReadPositionRequest) {
  return requestWithSignalr('SaveReadPosition', param)
}
/** 获取阅读位置 */
export function getReadPosition(id: number) {
  return requestWithSignalr('GetReadPosition', { Id: id })
}
/** 从一批id获取书籍列表 */
export function getBookListByIds(ids: number[]) {
  // 校验数量，接口限制一次最多24本
  if (process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION) {
    if (ids.length > 24) {
      throw new Error('单次批量操作最多24本')
    }
  }
  return requestWithSignalr<Types.BookInList[]>('GetBookListByIds', { Ids: ids })
}
/** 最大并行数量 */
getBookListByIds.MAX_CONCURRENT = 24

/** 取最新的6本书，无需登录 */
export function getLatestBookList(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetLatestBookList', param)
}

/** 取最近的排行榜 */
export function getRank(days: number) {
  return requestWithSignalr<Types.BookInList[]>('GetRank', { Days: days })
}

/** 编辑书籍信息 */
export function editBook(bid: number, request: Types.EditBookRequest) {
  return requestWithSignalr('UpdateBook', { Id: bid, Map: request })
}

/** 取编辑用的书籍信息 */
export function getBookEditInfo(bid: number) {
  return requestWithSignalr('GetBookEditInfo', { Id: bid })
}

/** 删除书籍 */
export function deleteBook(bid: number) {
  return requestWithSignalr('DeleteBook', { Id: bid })
}

/** 设置书籍 */
export function setBookSetting(request: Types.SetBookSetting) {
  return requestWithSignalr('SetBookSetting', request)
}

export function getBookSetting(bid: number) {
  return requestWithSignalr('GetBookSettings', { Id: bid })
}
