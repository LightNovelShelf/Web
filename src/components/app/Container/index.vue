<template>
  <q-page-container>
    <router-view v-slot="{ Component }">
      <template v-if="Component">
        <!-- TODO 想加个q-transition--fade，但测试下来有点问题 -->
        <keep-alive>
          <component :is="Component"></component>
        </keep-alive>
      </template>
    </router-view>
  </q-page-container>
  <!-- 登陆页跳转 -->
  <authentication-guard />
</template>

<script lang="ts" setup>
import AuthenticationGuard from './AuthenticationGuard.vue'
</script>

<style scoped></style>
