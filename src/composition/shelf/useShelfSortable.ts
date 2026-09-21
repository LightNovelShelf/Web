import Sortable from 'sortablejs'
import { onBeforeUnmount, watch } from 'vue'

import type { Ref } from 'vue'

export interface ShelfSortMove {
  from: number
  to: number
}

export function useShelfSortable(options: {
  element: Ref<HTMLElement | null | undefined>
  enabled: Ref<boolean>
  onMove: (move: ShelfSortMove) => void
  onInvalid: () => void
}): void {
  let sortable: Sortable | undefined

  const stop = watch(
    [options.element, options.enabled],
    ([element, enabled]) => {
      sortable?.destroy()
      sortable = undefined
      if (!element || !enabled) return

      sortable = new Sortable(element, {
        animation: 400,
        handle: '.js-drag-target',
        onEnd: ({ oldIndex, newIndex }) => {
          if (oldIndex === undefined || newIndex === undefined) {
            options.onInvalid()
            return
          }
          if (oldIndex === newIndex) return

          options.onMove({ from: oldIndex, to: newIndex })
        },
      })
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    stop()
    sortable?.destroy()
  })
}
