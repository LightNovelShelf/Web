import type { GetBookListRequest, GetBookListRes } from '@/services/book/types'
import type { Growth } from '@/services/points'

export interface PublicUserSummary {
  Id: number
  UserName: string
  Avatar: string
  Role: string
  Level: number
  RegisterAt: string
  BookCount: number
  CommunityThreadCount: number
  CommunityReplyCount: number
  CommentCount: number
}
export interface CurrentUser {
  Id: number
  Role: { Name: string }
  Avatar: string
  UserName: string
  Email: string
  RegisterAt: string
  InviteCode: string
  Level: number
  InteriorLevel: number
  UnreadNotificationCount: number
  UnreadDirectMessageCount: number
  Growth: Growth | null
}

export namespace ResetInviteCode {
  export interface Res {
    InviteCode: string
  }
}

export namespace GetMyBooks {
  export enum BookType {
    Novel = 'Novel',
    Comic = 'Comic',
  }

  export interface Request extends GetBookListRequest {
    Type: BookType
  }
  export type Response = GetBookListRes
}

export namespace QuickCreateNovel {
  export interface Request {
    // 章节数量
    Count: number
    Title: string
    Author: string
    Cover: string
    Introduction: string
    CategoryId: number
  }
  export type Response = number
}

export namespace QuickCreateComic {
  export interface Request {
    Cover: string
    Title: string
    Author: string
    Introduction: string
    CategoryName: '原创' | '连载' | '完结'
  }
  export type Response = number
}

export namespace UploadImage {
  export interface Request {
    FileName: string
    ImageData: Uint8Array
  }
  export interface Response {
    Url: string
  }
}

export namespace GetNotifications {
  export interface NotificationAction {
    Type: string
    Data: Record<string, unknown>
  }

  export interface Request {
    Page: number
    Size: number
  }

  export interface Response {
    TotalPages: number
    Page: number
    Data: Notification[]
  }

  export interface Notification {
    Id: number
    Actor: {
      Id: number
      UserName: string
      Avatar: string
    } | null
    Kind: string
    SchemaVersion: number
    Title: string
    Body: string
    Tone: string
    Action: NotificationAction | null
    Data: Record<string, unknown>
    IsRead: boolean
    ReadAt: string | null
    CreatedAt: string
  }
}

export namespace MarkNotifications {
  export interface Request {
    Ids: number[]
  }

  export type Response = void
}
