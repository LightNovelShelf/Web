import { ListResult } from '../types'
import { DateTime } from 'luxon'

export interface BookInList {
  Id: number
  Cover: string
  LastUpdateTime: Date
  UserName: string
  Title: string
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
    ExtraInfo: any
    Introduction: string
    LastUpdate: string
    LastUpdateTime: Date | DateTime
    Subscription: number
    Title: string
    User: any
    Views: number
  }
  ReadPosition: any
}

export interface GetBookListRequest {
  Page: number
  Order: string
}

export interface SaveReadPositionRequest {
  Bid: number
  Cid: number
  XPath: string
}
