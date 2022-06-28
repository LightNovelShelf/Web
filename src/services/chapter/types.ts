export interface GetChapterContentRequest {
  Bid: number
  SortNum: number
  Convert?: 't2s' | 's2t'
}

export interface EditChapterContentRequest {
  BookId: number
  SortNum: number
  Content?: string
  Title?: string
}

export interface DeleteChapterRequest {
  BookId: number
  SortNum: number
}

export interface ChangeChapterSortRequest {
  BookId: number
  OldSortNum: number
  NewSortNum: number
}
