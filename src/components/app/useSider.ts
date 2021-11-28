import { ref } from 'vue'

const siderShow = ref(false)

export function useSider() {
  return {
    siderShow
  }
}
