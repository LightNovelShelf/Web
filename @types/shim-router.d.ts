// This can be directly added to any of your `.ts` files like `router.ts`
// It can also be added to a `.d.ts` file, in which case you will need to add an export
// to ensure it is treated as a module
export {}

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {}

  type HistoryLocation = string

  /**
   * Internal normalized version of {@link ScrollPositionCoordinates} that always
   * has `left` and `top` coordinates.
   *
   * @internal
   */
  type _ScrollPositionNormalized = {
    behavior?: ScrollOptions['behavior']
    left: number
    top: number
  }

  /** @link https://github.com/vuejs/router/blob/v4.0.15/src/history/html5.ts#L24-L31 */
  interface StateEntry extends HistoryState {
    back: HistoryLocation | null
    current: HistoryLocation
    forward: HistoryLocation | null
    position: number
    replaced: boolean
    scroll: _ScrollPositionNormalized | null | false
  }
}
