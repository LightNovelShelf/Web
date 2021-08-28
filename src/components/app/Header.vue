<template>
  <n-layout-header class="header" bordered>
    <n-space class="header-title">
      <n-tooltip placement="bottom-start">
        <template #trigger>
          <n-icon :size="24">
            <InfoFilled />
          </n-icon>
        </template>
        欢迎来稿一个新的网站图标
      </n-tooltip>
      <div @click="changAppName">{{ appName }}</div>
    </n-space>

    <n-input class="search" autosize v-model:value="search" type="text" placeholder="搜索" />
    <div style="flex: 1"></div>
    <n-avatar round size="medium" src="https://q.qlogo.cn/headimg_dl?spec=100&dst_uin=1789263779" />
  </n-layout-header>
</template>

<script lang="tsx">
import { computed, defineComponent, ref } from 'vue'
import { icon } from '@/plugins/naive-ui'
import { useAppStore } from '@/store'

export default defineComponent({
  name: 'Header',
  components: {
    ...icon
  },
  setup() {
    const appStore = useAppStore()

    return {
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
}
</style>
