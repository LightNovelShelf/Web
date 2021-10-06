/** 请求选项 */
export interface RequestConfig<Param, Data> {
  /** 中断信号，可用来立即中断某个请求的返回（并抛错） */
  signal?: AbortSignal
  /** 拼接在url上的参数 */
  param?: Param
  /** 放在urlbody上的参数 */
  data?: Data
  /** 请求方法 */
  method?: 'GET' | 'POST'
}

/** 列表请求 */
export interface ListResult<T> {
  TotalPages: number
  Page: number
  Data: T[]
}
