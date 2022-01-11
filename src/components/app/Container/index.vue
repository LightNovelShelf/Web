<template>
  <q-page-container>
    <div :style="containerStyle">
      <page-stack>
        <router-view />
      </page-stack>
    </div>
  </q-page-container>
  <!-- 登陆页跳转 -->
  <authentication-guard />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import AuthenticationGuard from './AuthenticationGuard.vue'
import { useLayout } from '@/components/app/useLayout'
import PageStack from '@/components/app/Container/PageStack.vue'

export default defineComponent({
  components: { PageStack, AuthenticationGuard },
  setup() {
    let layout = useLayout()

    return {
      containerStyle: layout.containerStyle
    }
  }
})
</script>

<style scoped></style>
