export enum CommentType {
  Book = 'Book',
  Announcement = 'Announcement'
}

export namespace PostComment {
  export interface Request {
    Type: CommentType
    Id: number
    Content: string
    ReplyId?: number
    ParentId?: number
  }

  export interface Response {}
}

export namespace GetComment {
  export interface Request {
    Type: CommentType
    Id: number
    Page: number
  }

  export interface Response {
    Id: number
    TotalPages: number
    Users: any[]
    Commentaries: any[]
    Data: any[]
  }
}
