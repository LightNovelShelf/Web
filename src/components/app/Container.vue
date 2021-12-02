<template>
  <q-page-container>
    <n-loading-bar-provider>
      <div :style="{ padding: '12px' }">
        <router-view v-slot="{ Component }">
          <!-- TODO 想加个q-transition--fade，但测试下来有点问题 -->
          <keep-alive :exclude="['CollaboratorList']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </n-loading-bar-provider>
  </q-page-container>
</template>

<script lang="ts" setup></script>

<style scoped></style>
