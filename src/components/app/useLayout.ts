import { defineStore, storeToRefs } from 'pinia'
import { inject, computed, ref } from 'vue'

export const useLayout = () => {
  const ql = inject('_q_l_') as any
  const layoutStore = useLayoutStore()
  const { siderShow, siderBreakpoint, headerHeight, containerStyle } = storeToRefs(layoutStore)

  const headerOffset = computed(() => ql.header.offset)
  const dynaicHeaderHeight = computed<number>({
    get() {
      return layoutStore.dynaicHeaderHeight
    },
    set(value) {
      layoutStore.$patch({ dynaicHeaderHeight: value })
    }
  })

  return {
    siderShow,
    siderBreakpoint,
    headerHeight,
    containerStyle,
    headerOffset,
    dynaicHeaderHeight
  }
}

const useLayoutStore = defineStore('app.layout', {
  state: () => ({
    siderShow: false,
    siderBreakpoint: 1023,
    headerHeight: 58,
    dynaicHeaderHeight: 58,
    containerStyle: {
      padding: '12px'
    }
  })
})
