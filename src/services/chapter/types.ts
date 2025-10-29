export interface GetNovelContentRequest {
  Bid: number
  SortNum: number
  Convert?: 't2s' | 's2t' | null | undefined
}

interface GetChapterEditInfoBySortNum {
  Bid?: number
  SortNum?: number
}

interface GetChapterEditInfoByCid {
  Cid?: number
}

export type GetChapterEditInfo = GetChapterEditInfoBySortNum | GetChapterEditInfoByCid

interface EditChapterContentRequestBySortNum extends GetChapterEditInfoBySortNum {
  Map?: {
    Content?: string
    Title?: string
  }
}

interface EditChapterContentRequestByCid extends GetChapterEditInfoByCid {
  Map?: {
    Content?: string
    Title?: string
  }
}

export type EditChapterContentRequest = EditChapterContentRequestBySortNum | EditChapterContentRequestByCid

export interface ChangeChapterSortRequest {
  BookId: number
  OldSortNum: number
  NewSortNum: number
}
