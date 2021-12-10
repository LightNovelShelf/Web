/** 以帧为间隔节流 */
export function thresholdInFrame<T extends (...args: any[]) => void>(cb: T): T {
  const _cb = cb.bind(this) as T

  const context: { func: T | null } = {
    func: null
  }
  return function (...args: any[]) {
    const scheduled = !!context.func
    context.func = (() => _cb(...args)) as T

    if (!scheduled) {
      requestAnimationFrame(() => {
        if (!context.func) {
          return
        }
        context.func()
        context.func = null
      })
    }
  } as T
}
