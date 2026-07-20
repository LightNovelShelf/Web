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

export type GetComicEditInfo = GetNovelEditInfo

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

export type ComicChapterMap = {
  Title: string
  Images: string[]
}

interface UpdateComicChapterRequestBySortNum extends GetNovelEditInfoBySortNum {
  Map: ComicChapterMap
}

interface UpdateComicChapterRequestByCid extends GetNovelEditInfoByCid {
  Map: ComicChapterMap
}

export type UpdateComicChapterRequest = UpdateComicChapterRequestBySortNum | UpdateComicChapterRequestByCid

export interface CreateNewComicChapterRequest {
  Bid: number
  SortNum: number
  Map: ComicChapterMap
}

export interface ReorderChapterRequest {
  BookId: number
  OldSortNum: number
  NewSortNum: number
}
