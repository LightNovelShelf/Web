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
export async function getBookListByIds(ids: number[]) {
  return requestWithSignalr('GetBookListByIds', ids)
}
/** 取最新的6本书，无需登录 */
export async function getLatestBookList() {
  return requestWithSignalr<Types.GetBookListRes>('GetLatestBookList')
}
