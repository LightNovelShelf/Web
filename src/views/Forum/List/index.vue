<template>
  <q-page padding>
    <div class="q-gutter-y-md">
      <q-tabs dense v-model="tab" class="text-teal">
        <template v-for="option in tabOptions" :key="option.key">
          <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
        </template>
      </q-tabs>
      <q-tab-panels keep-alive v-model="tab" animated>
        <q-tab-panel name="Star">
          <forum-list :type="ForumType.Anime" />
        </q-tab-panel>

        <q-tab-panel name="Anime">
          <forum-list :type="ForumType.Anime" />
        </q-tab-panel>

        <q-tab-panel name="Comic">
          <forum-list :type="ForumType.Anime" />
        </q-tab-panel>

        <q-tab-panel name="Game">
          <forum-list :type="ForumType.Anime" />
        </q-tab-panel>

        <q-tab-panel name="Novel">
          <forum-list :type="ForumType.Anime" />
        </q-tab-panel>

        <q-tab-panel name="WebSite">
          <forum-list :type="ForumType.Website" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ForumList from 'src/views/Forum/List/components/ForumList.vue'
import { icon } from 'assets/icon'
import { ForumType } from 'src/services/forum/types'

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Star',
    key: 'Star',
    label: '收藏',
    icon: icon.mdiStar,
    disable: true
  },
  {
    name: 'Anime',
    key: 'Anime',
    label: '动画',
    icon: icon.mdiVideo,
    disable: false
  },
  {
    name: 'Comic',
    key: 'Comic',
    label: '漫画',
    icon: icon.mdiImage,
    disable: false
  },
  {
    name: 'Game',
    key: 'Game',
    label: '游戏',
    icon: icon.mdiController,
    disable: false
  },
  {
    name: 'Novel',
    key: 'Novel',
    label: '小说',
    icon: icon.mdiBook,
    disable: false
  },
  {
    name: 'WebSite',
    key: 'WebSite',
    label: '其他',
    icon: icon.mdiWeb,
    disable: false
  }
]
const tab = ref('WebSite')
</script>

<style scoped></style>
