<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    width="var(--slider-width)"
    :collapsed="collapsed"
    show-trigger="bar"
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
            <svg-icon color="var(--success-color)" size="24" :path="icon.mdiBroadcast" />
          </n-element>
          <n-element v-else>
            <svg-icon color="var(--error-color)" size="24" :path="icon.mdiBroadcastOff" />
          </n-element>
        </template>
        <span v-if="isOnline">当前在线</span>
        <span v-else>当前离线</span>
      </n-tooltip>
    </div>
  </n-layout-sider>
</template>

<script lang="tsx">
import { defineComponent, ref, computed } from 'vue'
import { icon } from '@/plugins/naive-ui/icon'
import { useRoute } from 'vue-router'
import { useOnline } from '@/composition/useOnline'

function renderIcon(icon: string) {
  return () => <svg-icon path={icon} />
}

const menuOptions = [
  {
    label: '首页',
    key: 'Home',
    route: 'Home',
    icon: renderIcon(icon.mdiHome)
  },
  {
    label: '公告',
    key: 'Announcement',
    route: 'Announcement',
    icon: renderIcon(icon.mdiBullhorn)
  },
  {
    label: '小说',
    key: 'BookList',
    icon: renderIcon(icon.mdiBook),
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
    icon: renderIcon(icon.mdiForum)
  }
]

export default defineComponent({
  name: 'Sider',
  setup() {
    const route = useRoute()
    let activeKey = computed({
      get: () => route.name,
      set: (val) => {
        console.log(val)
      }
    })

    return {
      icon,
      collapsed: ref(true),
      activeKey,
      search: ref(null),
      menuOptions,
      isOnline: useOnline(),
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
