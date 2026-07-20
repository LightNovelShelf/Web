import type { ListResult } from '../types'

export type ComicOrder = 'latest' | 'new' | 'view'

export interface ComicListRequest {
  Page?: number
  Size?: number
  Order?: ComicOrder
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

export interface ComicClassification {
  author?: string | null
  series_name?: string | null
  series_name_cn?: string | null
  tags?: string[]
  classified_at?: string
}

export interface ComicChapterSummary {
  Id: number
  SortNum: number
  Title: string
  CreatedAt: string
  UpdatedAt?: string | null
  PageCount: number
}

export interface ComicReadPosition {
  ChapterId: number
  Position: string
  ReadAt?: string
}

export interface ComicSeriesInfoResponse {
  Series: {
    Id: string
    Title: string
    OriginalTitle?: string | null
    Cover: string
    Author?: string | null
    Views: number
    Favorite: number
    Introduction: string
    CreatedAt: string
    LastUpdatedChapter: string
    LastUpdatedAt: string
    Extra?: {
      classification?: ComicClassification
      [key: string]: unknown
    }
  }
  Books: Array<{
    Id: number
    Title: string
    Uploader: {
      UserName: string
      Avatar: string
    }
    Cover: string
    CreatedAt: string
    LastUpdatedChapter: string
    LastUpdatedAt: string
    ReadPosition?: ComicReadPosition | null
    Chapters: ComicChapterSummary[]
  }>
}

export interface ComicInfoResponse {
  ReadPosition?: {
    ChapterId: number
    Position: string
  } | null
  Book: {
    Id: number
    Cover: string
    Title: string
    Author?: string | null
    Views: number
    Introduction: string
    CreatedAt: string
    LastUpdatedChapter: string
    LastUpdatedAt: string
    Favorite: number
    User: {
      Id: number
      Avatar: string
      UserName: string
    }
    Extra?: {
      classification?: ComicClassification
      [key: string]: unknown
    }
    Chapters: ComicChapterSummary[]
  }
}

export interface ComicImage {
  Url: string
  Placeholder: string
  Width: number
  Height: number
}

export interface ComicContentResponse {
  Chapter: {
    Id: number
    BookId: number
    BookName: string
    Title: string
    SortNum: number
    Images: ComicImage[]
  }
  ReadPosition?: {
    ChapterId: number
    Position: string
  } | null
}
