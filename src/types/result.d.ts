export declare type MessageModel<T> = {
  Status: number
  Success: boolean
  Msg: string
  Response: T
}

export declare type BookListResult = {
  TotalPages: number
  Page: number
  Data: any[]
}
