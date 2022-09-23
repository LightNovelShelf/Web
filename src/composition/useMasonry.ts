import { onMounted, onBeforeUnmount, ref, Ref } from 'vue'
import MiniMasonry from 'src/utils/minimasonry'

export interface UseMasonryAction {
  layout: () => void
  destroy: () => void
}

export function useMasonry(ele: Ref<Element>): UseMasonryAction {
  /** masonry实例 */
  const instance = ref<any>(null)

  onMounted(() => {
    instance.value = new MiniMasonry({
      container: ele.value,
      surroundingGutter: false,
      gutter: 15
    })
  })

  const actions: UseMasonryAction = {
    layout: () => instance.value?.layout(),
    destroy: () => instance.value?.destroy()
  }

  onBeforeUnmount(actions.destroy)

  return actions
}
