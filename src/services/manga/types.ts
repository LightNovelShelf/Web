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
  Cover: string
  Views: number
  CreatedAt: string
  LastUpdatedAt: string
  ChapterCount: number
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
