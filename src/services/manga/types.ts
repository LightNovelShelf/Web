import type { ListResult } from '../types'

export type ComicOrder = 'latest' | 'new' | 'view'

export interface ComicListRequest {
  Page?: number
  Size?: number
  Order?: ComicOrder
}

/** 漫画系列搜索：沿用 book 搜索维度，结果按系列聚合 */
export interface SearchComicSeriesRequest {
  KeyWords: string
  /** 搜索维度，对齐 book 搜索：fuzzy | exact | title | author | name | tags */
  Mode?: string
  Page?: number
  Size?: number
  IgnoreJapanese?: boolean
  IgnoreAI?: boolean
}

export interface ComicListItem {
  Id: number
  Title: string
  OriginalTitle?: string | null
  Cover: string
  Count: number
  LastUpdatedAt: string
}

export interface ComicListResponse extends ListResult<ComicListItem> {}

export interface ComicContentResponse {
  Chapter: {
    Id: number
    BookId: number
    BookName: string
    Title: string
    SortNum: number
    /** 本章总页数（与 Skip/Take 无关，用于前端预分配占位与进度条） */
    Total: number
    /** 本批图片在整章中的起始下标 */
    Skip: number
    Images: string[]
  }
  ReadPosition?: {
    ChapterId: number
    Position: string
  } | null
}
