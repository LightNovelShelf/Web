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
            {{ announcement.Content.length > 50 ? announcement.Content.substr(0, 50) + '...' : announcement.Content }}
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
import { onMounted, ref, Ref } from 'vue'
import { getAnnouncementList } from '@/services/context'
import { QInfiniteScroll } from 'quasar'

// interface Announcement {
//   Title: string
//   CreateTime: DateConstructor
//   Create: string
//   Before: string
//   Content: string
// }

let announcementList = ref<any[]>([])
let page = 1
let size = 12

// 去除HTML标签
function matchReg(str: string): string {
  let reg = /<\/?.+?\/?>/g
  return str.replace(reg, '')
}

// 发布时间差格式化
function getBeforeTime(before: number): string {
  return before < 1
    ? '少于1分钟前'
    : before < 60
    ? Math.round(before) + ' 分钟前'
    : (before /= 60) < 24
    ? Math.round(before) + ' 小时前'
    : Math.round((before /= 24)) + ' 日前'
}

// 滚动拉取数据
function onLoad(index, done) {
  const response = Promise.resolve(getAnnouncementList({ Page: page, Size: size }))
  response
    .then((res) => {
      announcementList.value.push(...res.Data)
      announcementList.value.forEach((element: any) => {
        const date = new Date(element.CreateTime)
        element.Create = date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate()
        element.Before = getBeforeTime((Date.now() - date.getTime()) / 1000 / 60)
        element.Content = matchReg(element.Content)
      })
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

onMounted(() => {
  //
})
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
