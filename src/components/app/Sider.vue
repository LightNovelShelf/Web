<template>
  <q-drawer v-model="siderShow" show-if-above bordered class="bg-grey-2" :width="240">
    <q-scroll-area class="fit">
      <q-list padding>
        <template v-for="option in menuOptions" :key="option.key">
          <q-separator class="q-my-md" v-if="option.label === 'separator'" />

          <q-item
            :to="(option.disabled ?? true) && option.route ? { name: option.route } : null"
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
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="tsx">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { icon } from '@/plugins/naive-ui/icon'
import { useRoute } from 'vue-router'
import { isConnected } from '@/services/utils'
import { getChapterContent } from '@/services/chapter'
import { useLayout } from './useLayout'

const menuOptions: Array<Record<string, any>> = [
  {
    label: '首页',
    key: 'Home',
    route: 'Home',
    icon: icon.mdiHome
  },
  {
    label: '公告',
    key: 'Announcement',
    route: 'Announcement',
    icon: icon.mdiBullhorn
  },
  {
    label: 'separator',
    key: 'separator 0'
  },
  {
    label: '全部小说',
    key: 'BookList',
    icon: icon.mdiBook,
    route: 'BookList'
  },
  {
    label: '订阅内容',
    key: 'Subscriptions',
    route: 'Subscriptions',
    disabled: true,
    icon: icon.mdiBullhorn
  },
  {
    label: '阅读历史',
    key: 'History',
    route: 'History',
    disabled: true,
    icon: icon.mdiHistory
  },
  {
    label: 'separator',
    key: 'separator 1'
  },
  {
    label: '社区',
    key: 'Community',
    route: 'Community',
    disabled: true,
    icon: icon.mdiForum
  },
  {
    label: 'separator',
    key: 'separator 2'
  },
  {
    label: '设置',
    key: 'Setting',
    route: 'Setting',
    disabled: true,
    icon: icon.mdiCog
  },
  {
    label: '帮助',
    key: 'Help',
    route: 'Help',
    disabled: true,
    icon: icon.mdiHelpCircle
  },
  {
    label: '发送反馈',
    key: 'send_feedback',
    icon: icon.mdiMessageAlert
  },
  {
    label: '贡献列表',
    key: 'collaborator',
    route: 'Collaborator',
    icon: icon.mdiAccountMultiple
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

    const { siderShow } = useLayout()

    return {
      icon,
      siderShow,
      activeKey,
      search: ref(null),
      menuOptions,
      isOnline: isConnected,
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
