<template>
  <n-layout-header class="header" bordered>
    <n-space class="header-title">
      <n-tooltip placement="bottom-start">
        <template #trigger>
          <svg-icon :size="24" :path="icon.mdiInformation" />
        </template>
        欢迎来稿一个新的网站图标
      </n-tooltip>
      <div @click="changAppName">{{ appName }}</div>
    </n-space>

    <n-input class="search" autosize v-model:value="search" type="text" placeholder="搜索" />
    <div style="flex: 1"></div>
    <n-space class="action" align="center" justify="center">
      <n-badge dot>
        <n-text>消息</n-text>
      </n-badge>
      <n-badge dot>
        <n-text>动态</n-text>
      </n-badge>
      <n-badge dot>
        <n-text>历史记录</n-text>
      </n-badge>
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

export default defineComponent({
  name: 'Header',
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
