<template>
  <n-layout class="home">
    <n-layout-header class="header" bordered>
      <div class="header-title">轻书架</div>

      <n-input class="search" autosize v-model:value="search" type="text" placeholder="搜索" />
    </n-layout-header>
    <n-layout class="content-wrapper" has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        width="var(--slider-width)"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :render-label="renderMenuLabel"
        />
      </n-layout-sider>
      <n-layout class="content" :native-scrollbar="false">
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2> <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2> <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
        <n-h2>平山道</n-h2>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<script>
import { defineComponent, h, ref } from 'vue'
import { NIcon } from 'naive-ui'
import { BookmarkOutline, CaretDownOutline, Home } from '@vicons/ionicons5'

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: '首页',
    key: 'home',
    route: 'home',
    icon: renderIcon(Home)
  },
  {
    label: '小说',
    key: 'novel',
    icon: renderIcon(Home)
  },
  {
    label: '社区',
    key: 'Community',
    icon: renderIcon(Home)
  },
  {
    label: '我的',
    key: 'my',
    icon: renderIcon(Home)
  }
]

export default defineComponent({
  setup() {
    return {
      collapsed: ref(true),
      activeKey: ref(null),
      search: ref(null),
      menuOptions,
      renderMenuLabel(option) {
        if ('href' in option) {
          return h('a', { href: option.href, target: '_blank' }, option.label)
        }
        return option.label
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.home {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1;
  --header-height: 64px;
  --side-padding: 24px;
  --slider-width: 220px;
  --content-padding-w: 36px;
  --content-padding-v: 24px;

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
    }

    .header-user {
    }
  }

  .content-wrapper {
    position: absolute;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    right: 0;

    .content {
      ::v-deep .n-scrollbar-content {
        padding: var(--content-padding-v) var(--content-padding-w);
      }
    }
  }
}
</style>
