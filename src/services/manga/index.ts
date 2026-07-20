import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './types'

export type { ComicOrder } from './types'

export function getComicList(request: Types.ComicListRequest) {
  return requestWithSignalr<Types.ComicListResponse>('GetComicList', request)
}

export function getComicInfo(id: number) {
  return requestWithSignalr<Types.ComicInfoResponse>('GetComicInfo', { Id: id })
}

export function getComicSeriesInfo(seriesTitle: string, order: Types.ComicOrder = 'latest') {
  return requestWithSignalr<Types.ComicSeriesInfoResponse>('GetComicSeriesInfo', {
    SeriesTitle: seriesTitle,
    Order: order,
  })
}

export function getComicContent(cid: number) {
  return requestWithSignalr<Types.ComicContentResponse>('GetComicContent', { Cid: cid })
}
