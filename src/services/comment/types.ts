export namespace PostComment {
  export interface Request {
    Id: number
    Content: string
    ReplyId?: number
    ParentId?: number
  }

  export interface Response {}
}

export namespace GetComment {
  export interface Request {
    Id: number
    Page: number
  }

  export interface Response {}
}
