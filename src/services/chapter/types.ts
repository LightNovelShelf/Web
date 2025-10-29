export interface GetNovelContentRequest {
  Bid: number
  SortNum: number
  Convert?: 't2s' | 's2t' | null | undefined
}

interface GetNovelEditInfoBySortNum {
  Bid?: number
  SortNum?: number
}

interface GetNovelEditInfoByCid {
  Cid?: number
}

export type GetNovelEditInfo = GetNovelEditInfoBySortNum | GetNovelEditInfoByCid

interface UpdateNovelChapterRequestBySortNum extends GetNovelEditInfoBySortNum {
  Map?: {
    Content?: string
    Title?: string
  }
}

interface UpdateNovelChapterRequestByCid extends GetNovelEditInfoByCid {
  Map?: {
    Content?: string
    Title?: string
  }
}

export type UpdateNovelChapterRequest = UpdateNovelChapterRequestBySortNum | UpdateNovelChapterRequestByCid

export interface ChangeChapterSortRequest {
  BookId: number
  OldSortNum: number
  NewSortNum: number
}
