/** 以帧为间隔防抖 */
export function debounceInFrame<T extends (...args: any[]) => void>(cb: T): T {
  let context = 0
  const _cb = cb.bind(this)
  return function (...args: any[]) {
    if (context) {
      cancelAnimationFrame(context)
    }

    context = requestAnimationFrame(() => {
      _cb(...args)
      context = 0
    })
  } as T
}
