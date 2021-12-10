<template>
  <q-page-container>
    <div :style="containerStyle">
      <router-view v-slot="{ Component }">
        <!-- TODO 想加个q-transition--fade，但测试下来有点问题 -->
        <keep-alive :exclude="['CollaboratorList']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </q-page-container>
  <!-- 登陆页跳转 -->
  <authentication-guard />
</template>

<script lang="ts">
import { computed, defineComponent, provide, ref } from 'vue'
import AuthenticationGuard from './AuthenticationGuard.vue'

export default defineComponent({
  components: { AuthenticationGuard },
  setup() {
    let containerPa = ref('12px')
    provide('containerPa', containerPa)

    const containerStyle = computed(() => ({
      padding: containerPa.value
    }))

    return {
      containerStyle
    }
  }
})
</script>

<style scoped></style>
