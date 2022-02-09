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
