<template>
  <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
    <q-toolbar>
      <q-btn flat dense round aria-label="Menu" :icon="icon.mdiMenu" @click="siderShow = !siderShow" />

      <q-btn flat no-caps no-wrap class="q-ml-xs" v-if="$q.screen.gt.xs">
        <div class="row flex-center">
          <q-icon size="24" :name="icon.mdiInformation" />
          <q-tooltip anchor="bottom right" self="top right"> 欢迎来稿一个新的网站图标 </q-tooltip>
        </div>
        <q-toolbar-title shrink class="text-weight-bold" @click="changAppName">
          {{ appName }}
        </q-toolbar-title>
      </q-btn>

      <q-input dense outlined square v-model="search" placeholder="搜索" />

      <q-space />

      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn round dense flat>
          <q-badge color="red" text-color="white" floating> 222 </q-badge>
          <q-tooltip>通知</q-tooltip>
          <q-icon :name="icon.mdiBell"></q-icon>
        </q-btn>

        <q-btn round dense flat label="动态">
          <q-badge color="red" text-color="white" rounded floating></q-badge>
        </q-btn>

        <q-btn round dense flat>
          <q-badge color="red" text-color="white" floating> 99+ </q-badge>
          <q-tooltip>通知</q-tooltip>
          <q-icon :name="icon.mdiMessageText"></q-icon>
        </q-btn>

        <div style="width: 20px" />

        <n-popover :show-arrow="false" placement="bottom-end" trigger="click">
          <template #trigger>
            <n-avatar round size="medium" src="https://q.qlogo.cn/headimg_dl?spec=100&dst_uin=1789263779" />
          </template>
          <template #header>
            <span>这里放用户信息</span>
          </template>
          <n-text strong depth="1">这里放一堆按钮</n-text>
        </n-popover></div
      >
    </q-toolbar>
  </q-header>
</template>

<script lang="tsx">
import { computed, defineComponent, ref } from 'vue'
import { icon } from '@/plugins/naive-ui'
import { useAppStore } from '@/store'
import { useSider } from './useSider'

export default defineComponent({
  name: 'Header',
  setup() {
    const appStore = useAppStore()
    const { siderShow } = useSider()

    return {
      icon,
      search: ref(''),
      siderShow,

      appName: computed(() => appStore.appName),
      changAppName() {
        appStore.asyncReverse()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  padding: 0 var(--side-padding);

  .header-title {
    align-items: center;
    font-size: 24px;
    width: calc(var(--slider-width) - var(--side-padding) + var(--content-padding-w));
  }

  .search {
    min-width: 200px;
    max-width: 300px;
  }

  .action:nth-child(n) {
    cursor: pointer;
  }
}
</style>
