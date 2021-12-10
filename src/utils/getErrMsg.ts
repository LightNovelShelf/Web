/** 涵盖项目范围内常见的错误场景消息取值 */
export function getErrMsg(err: unknown, fallbackMsg = '网络错误'): string {
  try {
    // 1. 假定是无法取值的对象
    if (!err) {
      // 这里判断一次是否是无法取值的对象是为了
      // 防止error是 null 等时，固定对外抛出 从null取值 的错误，干扰debug
      return fallbackMsg
    }
    // 2. 假定是个error对象
    // if (err instanceof Error) {
    //   return err.message
    // }

    // @ts-expect-error 3. 假定是个 error继生对象 或是 服务器返回的json
    return '' + (err.message || err.Message || err.msg || err.Msg || fallbackMsg)
  } catch (e) {
    // 以上都不是，就对新的error做取值
    return getErrMsg(e, fallbackMsg)
  }
}
