import MiniMasonry from 'minimasonry'
import { onMounted, onBeforeUnmount, ref } from 'vue'

import type { Ref } from 'vue'

export interface UseMasonryAction {
  layout: () => void
  destroy: () => void
}

export function useMasonry(ele: Ref<HTMLElement>): UseMasonryAction {
  /** masonry实例 */
  const instance = ref<any>(null)

  onMounted(() => {
    instance.value = new MiniMasonry({
      container: ele.value,
      surroundingGutter: false,
      gutter: 15,
    })
  })

  const actions: UseMasonryAction = {
    layout: () => instance.value?.layout(),
    destroy: () => instance.value?.destroy(),
  }

  onBeforeUnmount(actions.destroy)

  return actions
}
