import { requestWithSignalr } from '../internal/request'
import { ServerError } from '../internal/ServerError'
import { PATH } from '../path'
import { getSessionToken } from '../utils'
import * as Types from './types'

import type { SaveReadPositionRequest } from './types'
import type { ComicListResponse } from '@/services/manga/types'
import type { EditorFormat } from '@/services/types'

export { Types as BookServicesTypes }

/** 获取书籍列表 */
export function getBookList(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookList', param)
}

/** 获取指定书籍类型启用的分类 */
export function getBookCategories(type: 'Novel' | 'Comic') {
  return requestWithSignalr<Types.BookCategoryItem[]>('GetBookCategories', { Type: type })
}

/** 按书名（卷标题）搜索 */
export function getBookListByTitle(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookListByTitle', param)
}

/** 按作者搜索 */
export function getBookListByAuthor(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookListByAuthor', param)
}

/** 按作品名/系列名搜索（分类器） */
export function getBookListByName(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookListByName', param)
}

/** 按标签搜索（分类器，KeyWords 传逗号分隔多标签，AND 匹配） */
export function getBookListByTags(param: Types.GetBookListRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBookListByTags', param)
}

/** 按系列分组列出（分类器） */
export function getSeriesList(param: Types.GetSeriesListRequest) {
  return requestWithSignalr<Types.GetSeriesListRes>('GetSeriesList', param)
}

/** 精确列出某个系列下的全部书籍（分类器） */
export function getBooksBySeries(param: Types.GetBooksBySeriesRequest) {
  return requestWithSignalr<Types.GetBookListRes>('GetBooksBySeries', param)
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

/** 从一批 id 获取书籍列表 */
export function getBookListByIds(ids: number[]) {
  // 接口一次最多支持 24 本书。
  if (ids.length > 24) {
    throw new Error('单次批量操作最多 24 本')
  }

  return requestWithSignalr<Types.BookInList[]>('GetBookListByIds', { Ids: ids })
}

/** 最大并行数量 */
getBookListByIds.MAX_CONCURRENT = 24

/** 从一批分卷 id 获取漫画，后端按系列聚合返回系列列表 */
export function getComicSeriesByIds(ids: number[]) {
  if (ids.length > 24) {
    throw new Error('单次批量操作最多 24 本')
  }

  return requestWithSignalr<ComicListResponse>('GetBookListByIds', { Ids: ids, Type: 'Comic' })
}

/** 取最新的 6 本书，无需登录 */
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

/** 取编辑用的书籍信息；markdown 时简介由服务端转换 */
export function getBookEditInfo(bid: number, format: EditorFormat = 'html') {
  return requestWithSignalr('GetBookEditInfo', { Id: bid, Format: format })
}

/** 删除书籍 */
export function deleteBook(bid: number) {
  return requestWithSignalr('DeleteBook', { Id: bid })
}

interface DownloadOptions {
  signal?: AbortSignal
  onProgress?: (loaded: number, total: number) => void
}

/** 下载小说，导出 epub，需要下载权限 */
export function downloadBook(bid: number, options: DownloadOptions = {}) {
  return downloadFile(`${PATH.BOOK_DOWNLOAD}?bid=${bid}`, String(bid), options)
}

/** 下载漫画的一话，导出 cbz，需要下载权限 */
export function downloadChapter(cid: number, options: DownloadOptions = {}) {
  return downloadFile(`${PATH.BOOK_DOWNLOAD_CHAPTER}?cid=${cid}`, String(cid), options)
}

/** 响应是流式的，onProgress 只在服务端给了 Content-Length 时能拿到 total */
async function downloadFile(url: string, fallbackName: string, options: DownloadOptions) {
  const headers = new Headers({ Accept: 'application/octet-stream, application/json' })
  const token = await getSessionToken()
  if (token) headers.append('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { headers, signal: options.signal })

  if (!res.ok) {
    // 失败时后端返回的仍是统一的 MessageModel
    const content = await res.json().catch(() => null)
    throw new ServerError(content?.Msg || `下载失败(${res.status})`, content?.Status ?? res.status)
  }

  return {
    blob: await readBody(res, options.onProgress),
    fileName: parseFileName(res) ?? fallbackName,
  }
}

/** 边收边报进度；没有 onProgress 或不支持流时直接取 blob */
async function readBody(res: Response, onProgress?: (loaded: number, total: number) => void) {
  if (!onProgress || !res.body) return res.blob()

  const total = Number(res.headers.get('Content-Length')) || 0
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let loaded = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    loaded += value.length
    onProgress(loaded, total)
  }

  return new Blob(chunks as BlobPart[], { type: res.headers.get('Content-Type') ?? 'application/octet-stream' })
}

/** 从 Content-Disposition 里取文件名，中文书名走 filename*（RFC 5987） */
function parseFileName(res: Response) {
  const disposition = res.headers.get('Content-Disposition')
  if (!disposition) return null

  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1])
    } catch {
      /* 退回下面的 filename */
    }
  }

  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? null
}
