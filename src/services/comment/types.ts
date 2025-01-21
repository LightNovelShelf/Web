export enum CommentType {
  Book = 'Book',
  Announcement = 'Announcement',
}

export namespace PostComment {
  export interface Request {
    Type: CommentType
    Id: number
    Content: string
    ReplyId?: number | undefined | null
    ParentId?: number
  }
}

export namespace GetComment {
  export interface Request {
    Type: CommentType
    Id: number
    Page: number
  }

  export interface Response {
    Id: number
    Type: CommentType
    Page: number
    TotalPages: number
    Users: { [key: string]: any }
    Commentaries: { [key: string]: any }
    Data: { Id: number; Reply: number[] }[]
  }
}
