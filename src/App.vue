<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-layout class="app">
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
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              bottom: 24px;
              left: 0;
              right: 0;
            "
          >
            <n-tooltip :placement="collapsed ? 'top-start' : 'top'">
              <template #trigger>
                <n-icon size="24">
                  <OfflineBoltFilled />
                </n-icon>
              </template>
              当前离线
            </n-tooltip>
          </div>
        </n-layout-sider>
        <n-layout :native-scrollbar="false">
          <div class="content">
            <router-view />
          </div>
          <!-- <n-layout-footer class="footer" bordered>我是footer，关于本站，用户协议等，可以设定仅在home出现</n-layout-footer> -->
        </n-layout>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script lang="tsx">
import { computed, defineComponent, h, ref } from 'vue'
import { zhCN, dateZhCN, NIcon } from 'naive-ui'
import { icon } from './plugins/naive-ui'

import { useAppStore } from '@/store'

function renderIcon(icon) {
  return () => (
    <NIcon>
      <icon />
    </NIcon>
  )
}

const menuOptions = [
  {
    label: '首页',
    key: 'home',
    route: 'home',
    icon: renderIcon(icon.HomeFilled)
  },
  {
    label: '公告',
    key: 'announcement',
    route: 'announcement',
    icon: renderIcon(icon.AnnouncementFilled)
  },
  {
    label: '小说',
    key: 'book',
    icon: renderIcon(icon.BookRound),
    children: [
      {
        label: '全部',
        key: '全部'
      },
      {
        label: '日轻',
        key: '日轻'
      },
      {
        label: '原创',
        key: '原创'
      },
      {
        label: '韩轻',
        key: '韩轻'
      }
    ]
  },
  {
    label: '社区',
    key: 'community',
    disabled: true,
    icon: renderIcon(icon.ForumFilled)
  }
]

export default defineComponent({
  components: icon,
  setup() {
    const appStore = useAppStore()

    return {
      zhCN,
      dateZhCN,

      collapsed: ref(true),
      activeKey: ref(null),
      search: ref(null),
      menuOptions,
      renderMenuLabel(option) {
        if ('href' in option) {
          return h('a', { href: option.href, target: '_blank' }, option.label)
        }
        return option.label
      },
      appName: computed(() => appStore.appName),
      changAppName() {
        appStore.asyncReverse()
      }
    }
  }
})
</script>

<style lang="scss" scoped>
:global(.app) {
  --header-height: 64px;
  --side-padding: 24px;
  --slider-width: 220px;
  --content-padding-w: 36px;
  --content-padding-v: 24px;
}

.app {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1;

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

  .content-wrapper {
    position: absolute;
    top: var(--header-height);
    bottom: 0;
    left: 0;
    right: 0;

    .online {
      text-align: center;
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      align-self: flex-end;
    }

    .content {
      padding: var(--content-padding-v) var(--content-padding-w);
    }

    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 48px;
    }
  }
}
</style>
