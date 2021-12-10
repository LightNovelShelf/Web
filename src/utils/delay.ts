/**
 * 延时
 *
 * @example
 * ```js
 * await delay()()
 * ```
 *
 * @example
 * ```js
 * await delay(200)({ response: {} })
 * ```
 *
 * @example
 * ```js
 * const wait = delay(200)
 * while (true) { await wait() }
 * ```
 */
export function delay(ms = 1000) {
  return function <Res = unknown>(res?: Res) {
    return new Promise((r) => setTimeout(() => r(res), ms))
  }
}
