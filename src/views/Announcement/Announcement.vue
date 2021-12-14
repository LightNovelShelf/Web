<template>
  <!-- TODO 弄成下拉刷新 -->
  <q-infinite-scroll @load="onLoad" :offset="100">
    <q-list bordered separator class="rounded-borders title mx-auto">
      <q-item>
        <q-item-section class="text-h6">公告列表</q-item-section>
      </q-item>
      <q-item
        v-for="(announcement, index) in announcementList"
        :key="index"
        :to="{ name: 'AnnouncementDetail', params: { id: announcement.Id } }"
        clickable
        v-ripple
      >
        <q-item-section>
          <q-item-label class="text-subtitle1">[{{ announcement.Create }}] {{ announcement.Title }}</q-item-label>
          <q-item-label caption>
            {{ announcement.Content }}
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>{{ announcement.Before }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </template>
  </q-infinite-scroll>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { getAnnouncementList } from '@/services/context'
import { announcementListFormat, Announcement } from './announcementFormat'

let announcementList = reactive<Announcement[]>([])
let page = 1
let size = 24

// 滚动拉取数据
function onLoad(index, done) {
  const response = Promise.resolve(getAnnouncementList({ Page: page, Size: size }))
  response
    .then((res) => {
      // @ts-expect-error 不知道谁的问题
      announcementList.push(...announcementListFormat(res.Data))
      if (res.Data.length < size) {
        // 无法再拉取
        done(true)
      } else {
        page++
        done()
      }
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
