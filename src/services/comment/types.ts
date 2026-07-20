export enum CommentType {
  Book = 'Book',
  Announcement = 'Announcement',
  Series = 'Series',
}

export namespace PostComment {
  export interface Request {
    Type: CommentType
    Id: number
    SeriesTitle?: string
    Content: string
    ReplyId?: number | undefined | null
    ParentId?: number
  }
}

export namespace GetComments {
  export interface Request {
    Type: CommentType
    Id: number
    SeriesTitle?: string
    Page: number
  }

  export interface Response {
    Id: number
    SeriesTitle?: string
    Type: CommentType
    Page: number
    TotalPages: number
    Users: { [key: string]: any }
    Commentaries: { [key: string]: any }
    Data: { Id: number; Reply: number[] }[]
  }
}
