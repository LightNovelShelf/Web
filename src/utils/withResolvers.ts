// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#calling_withresolvers_on_a_non-promise_constructor

/** Promise.withResolvers 的 polyfill
 *
 * @example
 * ```
 * const { promise, resolve, reject } = withResolvers<number>()
 *
 * promise.then(value => {
 *   console.log(value) // 42
 * })
 *
 * // Later...
 * resolve(42)
 *
 * ```
 */
export function withResolvers<T>() {
  let resolveFn: (value: T | PromiseLike<T>) => void
  let rejectFn: (reason?: any) => void

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })

  return {
    promise,
    resolve: resolveFn!,
    reject: rejectFn!,
  }
}

export type WithResolversReturn<T> = ReturnType<typeof Promise.withResolvers<T>>
