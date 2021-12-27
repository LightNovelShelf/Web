export namespace PostAnnouncementComment {
  export interface Request {
    Id: number
    Content: string
    ReplyId?: number
    ParentId?: number
  }

  export interface Response {}
}

export namespace GetAnnouncementComment {
  export interface Request {
    Id: number
    Page: number
  }

  export interface Response {}
}
