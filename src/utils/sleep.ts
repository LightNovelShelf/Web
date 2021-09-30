/** 暂停指定时间，默认1秒 */
export function sleep(ms = 1000): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
