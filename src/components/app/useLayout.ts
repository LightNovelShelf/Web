import { inject, computed, reactive, toRefs } from 'vue'

const layoutStore = reactive({
  siderShow: false,
  siderBreakpoint: 1023,
  headerHeight: 58,
  containerStyle: {
    padding: '12px' //留给撑满的时候用
  }
})

export const useLayout = () => {
  const ql = inject('_q_l_') as any

  return {
    ...toRefs(layoutStore),
    headerOffset: computed(() => ql.header.offset)
  }
}
