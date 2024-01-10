<template><slot /></template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unAuthenticationNotify } from 'src/utils/biz/unAuthenticationNotify'

/** 监听鉴权失败消息 */
export default defineComponent({
  setup(props, ctx) {
    const route = useRoute()
    const router = useRouter()

    unAuthenticationNotify.useSubscribe(() => {
      // 必须要到这里才解构取值，不然解构后就不reactive了
      const { name, fullPath } = route

      if (name !== 'Login') {
        router.replace({ name: 'Login', params: { authRedirect: 1 }, query: { from: encodeURIComponent(fullPath) } })
      }
    })
  }
})
</script>
