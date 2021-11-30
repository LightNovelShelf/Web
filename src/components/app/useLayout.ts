import { ref } from 'vue'

const siderShow = ref(false)
const headerHeight = ref(58)

export function useLayout() {
  return {
    siderShow,
    headerHeight
  }
}
