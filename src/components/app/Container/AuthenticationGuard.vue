<template><slot /></template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unAuthenticationNotify } from '@/utils/biz/unAuthenticationNotify'

/** 监听鉴权失败消息 */
export default defineComponent(() => {
  const route = useRoute()
  const router = useRouter()

  unAuthenticationNotify.useSubscribe(() => {
    // 必须要到这里才解构取值，不然解构后就不reactive了
    const { name, fullPath } = route

    if (name !== 'Login') {
      router.replace({ name: 'Login', query: { from: encodeURIComponent(fullPath) } })
    }
  })
})
</script>
