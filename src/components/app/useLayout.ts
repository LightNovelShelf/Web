import { inject, computed, reactive, toRefs } from 'vue'

const layoutStore = reactive({
  siderShow: false,
  siderBreakpoint: 1023,
  headerHeight: 58,
})

export const useLayout = () => {
  const ql = inject('_q_l_') as any

  return {
    ...toRefs(layoutStore),
    headerOffset: computed(() => ql.header.offset),
  }
}
