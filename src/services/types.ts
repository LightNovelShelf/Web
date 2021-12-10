/** 用到的http method */
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST'
}
/** 请求选项 */
export interface RequestConfig<Data> {
  /** 中断信号，可用来立即中断某个请求的返回（并抛错） */
  signal?: AbortSignal
  /** 请求数据；get请求会放在url上，post则json序列化放在body上 */
  payload?: Data
  /** 请求方法 @default 'POST' */
  method?: RequestMethod
}

/** 列表请求 */
export interface ListResult<T> {
  TotalPages: number
  Page: number
  Data: T[]
}
