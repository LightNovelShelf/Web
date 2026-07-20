import type { ListResult } from '../types'

export interface BookInList {
  Id: number
  Type?: 'Novel' | 'Comic'
  SeriesTitle?: string | null
  Cover: string
  // TODO: 走了二进制解码后自动转Date对象的特性丢失了，就是一个ISO 8601的日期
  LastUpdatedAt: Date
  UserName: string
  Title: string
  Level?: number
  InteriorLevel?: number
  Category?: {
    ShortName: string
    Name: string
    Color: string
  }
}

export interface GetBookListRes extends ListResult<BookInList> {}

/** 系列列表项（分类器分组结果） */
export interface SeriesInList {
  /** 系列名（中文名优先，空回落原名） */
  Name: string
  /** 代表封面 */
  Cover: string
  /** 系列内书籍数量 */
  Count: number
  /** 系列内书籍的最近更新时间 */
  LastUpdatedAt: Date
}

export interface GetSeriesListRes extends ListResult<SeriesInList> {}

export interface GetSeriesListRequest {
  Type?: number
  Page?: number
  Size?: number
  Order?: 'new' | 'view' | 'latest'
  IgnoreJapanese?: boolean
  IgnoreAI?: boolean
}

export interface GetBooksBySeriesRequest extends GetSeriesListRequest {
  SeriesName: string
}

interface ChapterInfo {
  Title: string
  Id: number
}

interface BookClassification {
  author?: string | null
  series_name?: string | null
  series_name_cn?: string | null
  tags?: string[]
  classified_at?: string
}

export interface GetBookInfoRes {
  Book: {
    Arthur: string
    Category: any
    Chapter: ChapterInfo[]
    Id: number
    Cover: string
    Extra?: {
      classification?: BookClassification
      [key: string]: unknown
    }
    Introduction: string
    Author: string | null
    LastUpdatedChapter: string
    LastUpdatedAt: Date
    CreatedAt: Date
    Favorite: number
    Title: string
    CanEdit: boolean
    User: {
      Id: number
      Avatar: string
      UserName: string
    }
    Views: number
  }
  ReadPosition: any
}

export interface GetBookListRequest {
  Page?: number
  Size?: number
  KeyWords?: string
  Order?: 'new' | 'view' | 'latest'
  IgnoreJapanese?: boolean
  IgnoreAI?: boolean
}

/**
 * 搜索维度
 * - fuzzy: 标题 bigm 模糊（默认，走 GetBookList）
 * - exact: 精确（标题/作者 Contains，走 GetBookList 并以引号包裹关键词）
 * - title: 按书名（卷标题）
 * - author: 按作者
 * - name: 按作品名/系列名（分类器）
 * - tags: 按标签（分类器，逗号分隔多标签 AND 匹配）
 */
export type SearchMode = 'fuzzy' | 'exact' | 'title' | 'author' | 'name' | 'tags'

export interface SaveReadPositionRequest {
  Bid: number
  Cid: number
  XPath: string
}

export interface EditBookRequest {
  Cover?: string
  Title?: string
  Author?: string
  Introduction?: string
  // 分类ID
  CategoryId?: number
  Level?: number
  InteriorLevel?: number
}

export interface SetBookSetting {
  Bid: number
  Settings: Record<string, any>
}
