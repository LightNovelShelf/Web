import type { EditorFormat, ListResult } from '../types'

export type BookType = 'Novel' | 'Comic'

export interface BookInList {
  Id: number
  Type?: BookType
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

export interface BookCategoryItem {
  Id: number
  Name: string
  ShortName: string
  Color: string
}

export interface GetBookListRes extends ListResult<BookInList> {}

/** 系列列表项（分类器分组结果） */
export interface SeriesInList {
  /** 系列名（中文名优先，空回落原名，再空回落书名） */
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
  Type?: BookType
  Page?: number
  Size?: number
  Order?: 'new' | 'view' | 'latest'
  IgnoreJapanese?: boolean
  CategoryId?: number
  IgnoreAI?: boolean
}

export interface GetBooksBySeriesRequest extends GetSeriesListRequest {
  SeriesName: string
}

export interface ChapterInfo {
  Id: number
  SortNum: number
  Title: string
  CreatedAt: Date
  UpdatedAt?: Date | null
  PageCount: number
  DownloadCost: number
}

export interface BookSeriesItem {
  Id: number
  Title: string
  Cover: string
}

export interface BookClassification {
  author?: string | null
  /** 精确对应本书的 bgm.tv 条目 id；null 表示 bgm.tv 上没有对应条目 */
  subject_id?: number | null
  /** 该条目所属的系列主条目 id */
  series_id?: number | null
  series_name?: string | null
  series_name_cn?: string | null
  tags?: string[]
  classified_at?: string
}
export interface EditableBook extends EditBookRequest {
  Id: number
  Type: 'Novel' | 'Comic'
  Cover: string
  Title: string
  Author: string
  Introduction: string
  CategoryId: number
  Level: number
  InteriorLevel: number
  DownloadAllowed: boolean
  Extra?: {
    classification?: BookClassification
    [key: string]: unknown
  }
  Chapters: Array<{ Id: number; Title: string }>
  Format: EditorFormat
}

export interface GetBookEditInfoResponse {
  Book: EditableBook
  Categories: Array<{ Id: number; Name: string }>
}

export interface GetBookInfoRes {
  SeriesTitle: string
  Series: BookSeriesItem[]
  Book: {
    Id: number
    Type: BookType
    Chapters: ChapterInfo[]
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
    CanDownload: boolean
    /** 下载整本需消耗的金币，0 表示免费 */
    DownloadCost: number
    User: {
      Id: number
      Avatar: string
      UserName: string
    }
    Views: number
  }
  ReadPosition?: {
    ChapterId: number
    Position: string
  } | null
}

export interface GetBookListRequest {
  Page?: number
  Size?: number
  KeyWords?: string
  Order?: 'new' | 'view' | 'latest'
  IgnoreJapanese?: boolean
  IgnoreAI?: boolean
  CategoryId?: number
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
  DownloadAllowed?: boolean
  /** 以下五项写入 extra.classification，只提交出现的键 */
  SubjectId?: number | null
  SeriesId?: number | null
  SeriesName?: string
  SeriesNameCn?: string
  Tags?: string[]
}

export interface SetBookSetting {
  Bid: number
  Settings: Record<string, any>
}
