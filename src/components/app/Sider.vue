<template>
  <q-drawer v-model="siderShow" show-if-above bordered class="bg-grey-2" :width="240">
    <q-scroll-area class="fit">
      <q-list padding v-for="index in [1, 2, 3, 4, 5]" :key="index">
        <template v-for="option in menuOptions" :key="option.key">
          <q-separator class="q-my-md" v-if="option.label === 'separator'" />

          <q-item v-ripple clickable v-else>
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
import { useSider } from './useSider'

const menuOptions = [
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
    label: '小说',
    key: 'BookList',
    icon: icon.mdiBook,
    route: 'BookList'
  },
  {
    label: 'separator',
    key: 'separator 1',
    icon: null,
    route: null
  },
  {
    label: '社区',
    key: 'Community',
    route: 'Community',
    disabled: true,
    icon: icon.mdiForum
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

    const { siderShow } = useSider()

    onMounted(async () => {
      console.log(await getChapterContent({ SortNum: 1, Bid: 318 }))
    })

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
