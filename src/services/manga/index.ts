import { invokeHub } from '@/services/transport'

import type * as Types from './types'

export type { ComicOrder } from './types'

export function getComicList(request: Types.ComicListRequest) {
  return invokeHub<Types.ComicListResponse>('GetComicList', request)
}

/** 漫画系列搜索（沿用 book 搜索维度，结果按系列聚合） */
export function searchComicSeries(request: Types.SearchComicSeriesRequest) {
  return invokeHub<Types.ComicListResponse>('SearchComicSeries', request)
}

export function getComicInfo(id: number) {
  return invokeHub<Types.ComicInfoResponse>('GetComicInfo', { Id: id })
}

export function getComicSeriesInfo(seriesTitle: string, order: Types.ComicOrder = 'latest') {
  return invokeHub<Types.ComicSeriesInfoResponse>('GetComicSeriesInfo', {
    SeriesTitle: seriesTitle,
    Order: order,
  })
}

/** 分批拉取漫画图片，每次 6 页。首批 Skip=0 时才返回阅读位置。 */
export function getComicContent(cid: number, skip = 0, take = 6) {
  return invokeHub<Types.ComicContentResponse>('GetComicContent', { Cid: cid, Skip: skip, Take: take })
}
