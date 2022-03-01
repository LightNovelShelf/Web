import { ListResult } from '@/services/types'

export interface OnlineInfo {
  OnlineCount: number
  MaxOnline: number
  DayCount: number
}

export interface Announcement {
  Id: number
  Title: string
  CreateTime: Date | string
  Content: string
}

export namespace GetAnnouncementList {
  export interface Request {
    Page: number
    Size: number
  }
  export type Response = ListResult<Announcement>
}

export namespace GetAnnouncementDetail {
  export interface Request {
    Id: number
  }
  export type Response = Announcement
}
