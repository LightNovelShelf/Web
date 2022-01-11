<script lang="tsx">
import { watchEffect, h, onMounted, onActivated, onDeactivated, ref, VNode, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { Component } from '@vue/runtime-core'

const stack = []

export default {
  name: 'PageStack',
  setup(props, context) {
    let first = true

    const node = ref<VNode>()
    const route = useRoute()

    const render = () => {
      node.value = context.slots.default()
    }

    // watch(
    //   () => route.matched,
    //   () => {
    //     console.log(route.matched)
    //     if (route.matched.length > 0 && route.matched[0]) {
    //       let a = route.matched[0].components['default']
    //       node.value = h(a, { props: route.matched[0].props })
    //     }
    //   }
    // )

    // 在每次判断路由为前进或第一次进入时加载数据
    onMounted(async () => {
      first = false
      render()
    })

    const router = useRoute()
    onActivated(async () => {
      if (first && router.meta.reload) {
        // render()
      }
    })

    onDeactivated(() => (first = true))

    return () => node.value
  }
}
</script>
