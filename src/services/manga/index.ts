import { requestWithSignalr } from 'src/services/internal/request'

import type * as Types from './types'

export type { ComicOrder } from './types'

export function getComicList(request: Types.ComicListRequest) {
  return requestWithSignalr<Types.ComicListResponse>('GetComicList', request)
}

/** 漫画系列搜索（沿用 book 搜索维度，结果按系列聚合） */
export function searchComicSeries(request: Types.SearchComicSeriesRequest) {
  return requestWithSignalr<Types.ComicListResponse>('SearchComicSeries', request)
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
