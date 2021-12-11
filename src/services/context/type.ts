import { ListResult } from '@/services/types'

export interface OnlineInfo {
  OnlineCount: number
  MaxOnline: number
  DayCount: number
}

export namespace GetAnnouncementList {
  export interface Request {
    Page: number
    Size: number
  }
  export type Response = ListResult<unknown>
}

export namespace GetAnnouncementDetail {
  export interface Request {
    Id: number
  }
}
