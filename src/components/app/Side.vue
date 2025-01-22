<template>
  <q-drawer
    v-model="siderShow"
    show-if-above
    bordered
    :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-2'"
    :width="240"
    :breakpoint="siderBreakpoint"
    :behavior="['Forum'].includes(currentRouteName()) ? 'mobile' : 'default'"
  >
    <q-scroll-area class="fit">
      <q-list padding>
        <template v-for="option in menuOptions" :key="option.key">
          <q-separator class="q-my-md" v-if="option.label === 'separator'" />

          <q-item
            :to="!(option.disabled ?? false) && option.route ? { name: option.route, params: option.params } : null"
            :disable="option.disabled"
            v-ripple="option.disabled ? !option.disabled : true"
            clickable
            v-else
          >
            <q-item-section avatar>
              <q-icon color="grey" :name="option.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ option.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="temp-box" />

      <div class="absolute-bottom column flex-center" style="bottom: 24px">
        <div v-if="commitSha === 'dev'" class="q-pb-sm">网页版本：dev</div>
        <div v-else class="q-pb-sm">
          网页版本：
          <a :href="`https://github.com/LightNovelShelf/Web/tree/${commitSha}`" target="_blank">{{ commitSha }}</a>
        </div>
        <div class="row flex-align-center">
          <q-icon
            left
            v-if="connectState === HubConnectionState.Connected"
            color="positive"
            size="24px"
            name="mdiBroadcast"
          />
          <q-icon left v-else color="negative" size="24px" name="mdiBroadcast" />

          <span v-if="connectState === HubConnectionState.Connected">当前在线</span>
          <span v-else-if="connectState === HubConnectionState.Reconnecting">正在尝试重新连接</span>
          <span v-else>当前离线，等待连接</span>
        </div>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import { HubConnectionState } from '@microsoft/signalr'

import { connectState } from 'src/services/utils'

import { useLayout } from './useLayout'

const menuOptions: Array<Record<string, any>> = [
  {
    label: '首页',
    key: 'Home',
    route: 'Home',
    icon: 'mdiHome',
  },
  {
    label: '公告',
    key: 'Announcement',
    route: 'Announcement',
    icon: 'mdiBullhorn',
  },
  {
    label: '订阅内容',
    key: 'Subscriptions',
    route: 'Subscriptions',
    disabled: true,
    icon: 'mdiPinwheel',
  },
  {
    label: 'separator',
    key: 'separator 0',
  },
  {
    label: '全部小说',
    key: 'BookList',
    icon: 'mdiBook',
    route: 'BookList',
    params: { order: 'latest', page: '1' },
  },
  {
    label: '近期排行',
    key: 'BookRank',
    icon: 'mdiFire',
    route: 'BookRank',
    params: { type: 'weekly' },
  },
  {
    label: '我的书架',
    key: 'MyShelf',
    route: 'MyShelf',
    icon: 'mdiFolderHeartOutline',
  },
  {
    label: 'separator',
    key: 'separator 1',
  },
  {
    label: '社区',
    key: 'Community',
    route: 'ForumList',
    disabled: true,
    icon: 'mdiForum',
  },
  {
    label: '阅读历史',
    key: 'History',
    route: 'History',
    icon: 'mdiHistory',
  },
  {
    label: 'separator',
    key: 'separator 2',
  },
  {
    label: '设置',
    key: 'Setting',
    route: 'Setting',
    icon: 'mdiCog',
  },
  {
    label: '帮助',
    key: 'Help',
    route: 'Help',
    disabled: true,
    icon: 'mdiHelpCircle',
  },
  {
    label: '发送反馈',
    key: 'send_feedback',
    disabled: true,
    icon: 'mdiMessageAlert',
  },
  {
    label: '贡献列表',
    key: 'collaborator',
    route: 'Collaborator',
    icon: 'mdiAccountMultiple',
  },
]
const commitSha = process.env.VUE_COMMIT_SHA

const layout = useLayout()
const { siderShow, siderBreakpoint } = layout

const currentRouteName = () => {
  const routeName = useRoute().name

  if (typeof routeName === 'string') {
    return routeName
  } else if (typeof routeName === 'symbol') {
    // TODO
    return ''
  } else {
    return ''
  }
}
</script>

<style scoped>
.temp-box {
  height: 50px;
}
</style>
