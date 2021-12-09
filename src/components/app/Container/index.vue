<template>
  <q-page-container class="body">
    <div :style="{ padding: '12px' }">
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
import { defineComponent } from 'vue'
import AuthenticationGuard from './AuthenticationGuard.vue'

export default defineComponent({
  components: { AuthenticationGuard }
})
</script>

<style scoped></style>
