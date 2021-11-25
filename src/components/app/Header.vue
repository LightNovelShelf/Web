<template>
  <n-layout-header class="header" bordered>
    <n-space class="header-title">
      <q-btn flat dense round aria-label="Menu" :icon="icon.mdiMenu" />

      <div class="row flex-center">
        <q-icon :name="icon.mdiInformation" />
        <q-tooltip anchor="bottom right" self="top right"> 欢迎来稿一个新的网站图标 </q-tooltip>
      </div>

      <div @click="changAppName">{{ appName }}</div>
    </n-space>

    <q-input dense outlined square v-model="search" placeholder="搜索" />

    <div style="flex: 1"></div>
    <n-space class="action" align="center" justify="center">
      <q-btn round dense flat>
        <q-badge color="red" text-color="white" floating> 222 </q-badge>
        <q-tooltip>通知</q-tooltip>
        <svg-icon :path="icon.mdiBell"></svg-icon>
      </q-btn>

      <q-btn round dense flat label="动态">
        <q-badge color="red" text-color="white" rounded floating></q-badge>
      </q-btn>

      <q-btn round dense flat>
        <q-badge color="red" text-color="white" floating> 99+ </q-badge>
        <q-tooltip>通知</q-tooltip>
        <svg-icon :path="icon.mdiMessageText"></svg-icon>
      </q-btn>

      <div />

      <n-popover :show-arrow="false" placement="bottom-end" trigger="click">
        <template #trigger>
          <n-avatar round size="medium" src="https://q.qlogo.cn/headimg_dl?spec=100&dst_uin=1789263779" />
        </template>
        <template #header>
          <span>这里放用户信息</span>
        </template>
        <n-text strong depth="1">这里放一堆按钮</n-text>
      </n-popover>
    </n-space>
  </n-layout-header>
</template>

<script lang="tsx">
import { computed, defineComponent, ref } from 'vue'
import { icon } from '@/plugins/naive-ui'
import { useAppStore } from '@/store'
import SvgIcon from '@/plugins/naive-ui/components/SvgIcon.vue'

export default defineComponent({
  name: 'Header',
  components: { SvgIcon },
  setup() {
    const appStore = useAppStore()

    return {
      icon,
      search: ref(''),

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
