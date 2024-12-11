import type { Ref} from 'vue';
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, toRaw } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'

/** keep-alive的组件是否激活展示 */
export function useIsActivated(): Ref<boolean> {
  const isActivated = ref(true)
  // toRaw得到第一次挂载时所在路由
  const route = toRaw(useRoute())

  onMounted(() => (isActivated.value = true))
  onActivated(() => (isActivated.value = true))

  /**
   * 使用 onBeforeRouteLeave 是因为 onDeactivated 的触发 晚于 useRoute 的改变
   * 这会导致外部判断 isActivated 不够准确：
   * 即使往别的页面走了， `watch(() => [route, isActivated], () => {})` 也还是因为 isActivated 为 true 而 无法知道用户已经要走了
   */
  onBeforeRouteLeave((to, from, next) => {
    isActivated.value = to.name === route.name

    next()
  })
  onDeactivated(() => (isActivated.value = false))
  onBeforeUnmount(() => (isActivated.value = false))

  return isActivated
}
