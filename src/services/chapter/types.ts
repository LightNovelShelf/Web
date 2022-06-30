export interface GetChapterContentRequest {
  Bid: number
  SortNum: number
  Convert?: 't2s' | 's2t'
}

interface GetChapterEditInfoBySortNum {
  BookId?: number
  SortNum?: number
}

interface GetChapterEditInfoByCid {
  Cid?: number
}

export type GetChapterEditInfo = GetChapterEditInfoBySortNum | GetChapterEditInfoByCid

interface EditChapterContentRequestBySortNum extends GetChapterEditInfoBySortNum {
  Content?: string
  Title?: string
}

interface EditChapterContentRequestByCid extends GetChapterEditInfoByCid {
  Content?: string
  Title?: string
}

export type EditChapterContentRequest = EditChapterContentRequestBySortNum | EditChapterContentRequestByCid

export interface DeleteChapterRequest {
  BookId: number
  SortNum: number
}

export interface ChangeChapterSortRequest {
  BookId: number
  OldSortNum: number
  NewSortNum: number
}
