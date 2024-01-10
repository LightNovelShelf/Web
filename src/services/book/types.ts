import { ListResult } from '../types'

export interface BookInList {
  Id: number
  Cover: string
  Placeholder?: string
  // TODO: 走了二进制解码后自动转Date对象的特性丢失了，就是一个ISO 8601的日期
  LastUpdateTime: Date
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
interface ChapterInfo {
  Title: string
  Id: number
}
export interface GetBookInfoRes {
  Book: {
    Arthur: string
    Category: any
    Chapter: ChapterInfo[]
    Id: number
    Cover: string
    Placeholder?: string
    ExtraInfo: any
    Introduction: string
    Author: string
    LastUpdate: string
    LastUpdateTime: Date
    CreatedTime: Date
    Likes: number
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
  Page: number
  Size: number
  KeyWords?: string
  Order?: 'new' | 'view' | 'latest'
  IgnoreJapanese?: boolean
}

export interface SaveReadPositionRequest {
  Bid: number
  Cid: number
  XPath: string
}

export interface EditBookRequest {
  Bid: number
  Cover: string
  Title: string
  Author: string
  Introduction: string
  // 分类ID
  CategoryId: number
}

export interface SetBookSetting {
  Bid: number
  Settings: Record<string, any>
}
