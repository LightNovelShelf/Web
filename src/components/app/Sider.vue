<template>
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
      v-model:value="activeKey"
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
          <n-element v-if="isOnline">
            <n-icon color="var(--success-color)" size="24">
              <OnlinePredictionFilled />
            </n-icon>
          </n-element>
          <n-element v-else>
            <n-icon color="var(--error-color)" size="24">
              <OfflineBoltFilled />
            </n-icon>
          </n-element>
        </template>
        <span v-if="isOnline">当前在线</span>
        <span v-else>当前离线</span>
      </n-tooltip>
    </div>
  </n-layout-sider>
</template>

<script lang="tsx">
import { Component, defineComponent, ref, computed } from 'vue'
import { icon } from '../../plugins/naive-ui/icon'
import { NIcon } from 'naive-ui'
import { useAppStore } from '@/store'
import { useRoute } from 'vue-router'

function renderIcon(icon: Component) {
  return () => (
    <NIcon>
      <icon />
    </NIcon>
  )
}

const menuOptions = [
  {
    label: '首页',
    key: 'Home',
    route: 'Home',
    icon: renderIcon(icon.HomeFilled)
  },
  {
    label: '公告',
    key: 'Announcement',
    route: 'Announcement',
    icon: renderIcon(icon.AnnouncementFilled)
  },
  {
    label: '小说',
    key: 'BookList',
    icon: renderIcon(icon.BookRound),
    route: 'BookList',
    children: [
      {
        label: '全部',
        key: 'BookList',
        route: 'BookList'
      },
      {
        label: '日轻',
        key: '日轻',
        disabled: true,
        route: 'BookList'
      },
      {
        label: '原创',
        key: '原创',
        disabled: true,
        route: 'BookList'
      }
    ]
  },
  {
    label: '社区',
    key: 'Community',
    route: 'Community',
    disabled: true,
    icon: renderIcon(icon.ForumFilled)
  }
]

export default defineComponent({
  components: {
    ...icon
  },
  name: 'Sider',
  setup() {
    const route = useRoute()
    let activeKey = computed({
      get: () => route.name,
      set: (val) => {
        console.log(val)
      }
    })
    const appStore = useAppStore()

    return {
      collapsed: ref(true),
      activeKey,
      search: ref(null),
      menuOptions,
      isOnline: computed(() => appStore.isConnected),
      renderMenuLabel(option: any) {
        if (!option.disabled && !option.children) {
          return <router-link to={{ name: option.route }}>{option.label}</router-link>
        }
        return option.label
      }
    }
  }
})
</script>

<style scoped></style>
