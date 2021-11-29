import { ListResult } from '../types'

export interface BookInList {
  Id: number
  Cover: string
  LastUpdateTime: Date
  UserName: string
  Title: string
  Category?: {
    ShortName: string
  }
}

export interface GetBookListRes extends ListResult<BookInList> {}
export interface GetBookInfoRes {}

export interface GetBookListRequest {
  Page: number
}
