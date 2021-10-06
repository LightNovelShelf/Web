/** 涵盖项目范围内常见的错误场景消息取值 */
export function getErrMsg(err: unknown, fallbackMsg = '网络错误'): string {
  try {
    // 1. 假定是无法取值的对象
    if (!err) {
      return fallbackMsg
    }
    // 2. 假定是个error对象
    if (err instanceof Error) {
      return err.message
    }

    // @ts-expect-error 3. 假定是个服务器返回的json
    return err.message || err.msg || fallbackMsg
  } catch (e) {
    // 以上都不是，就对新的error做取值
    return getErrMsg(e, fallbackMsg)
  }
}
