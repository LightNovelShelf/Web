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
  export type NotificationType = 'Comment' | 'CommentReply' | 'CommunityThreadReply' | 'CommunityThreadChildReply'

  export type NotificationObjectType = 'Book' | 'Announcement' | 'CommunityThread' | 'Series'

  export interface NotificationExtra {
    /** 系列通知没有实体对象，为 null；跳转看 series_title */
    object_id: number | null
    object_title: string
    series_title?: string | null
    preview: string
    reply_id?: number | null
    parent_reply_id?: number | null
    reply_to_reply_id?: number | null
    reply_preview?: string | null
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
    Type: NotificationType
    ObjectType: NotificationObjectType
    ObjectId: number | null
    IsRead: boolean
    CreatedAt: string
    Extra: NotificationExtra
  }
}

export namespace MarkNotifications {
  export interface Request {
    Ids: number[]
  }

  export type Response = void
}
