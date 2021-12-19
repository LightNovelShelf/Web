import { defineStore, storeToRefs } from 'pinia'
import { inject, computed } from 'vue'

export const useLayout = () => {
  const ql = inject('_q_l_') as any
  const layoutStore = useLayoutStore()
  const { siderShow, siderBreakpoint, headerHeight, containerStyle } = storeToRefs(layoutStore)

  const headerOffset = computed(() => ql.header.offset)

  return {
    siderShow,
    siderBreakpoint,
    headerHeight,
    containerStyle,
    headerOffset
  }
}

const useLayoutStore = defineStore('app.layout', {
  state: () => ({
    siderShow: false,
    siderBreakpoint: 1023,
    headerHeight: 58,
    containerStyle: {
      padding: '12px'
    }
  })
})
