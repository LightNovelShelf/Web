<template>
  <q-page padding>
    <q-infinite-scroll @load="onLoad" :offset="100" ref="scroll">
      <q-list bordered separator class="rounded-borders title mx-auto">
        <q-item>
          <q-item-section class="text-h6">
            <div class="row flex-center">
              <div class="text-h6">公告列表</div>
              <q-space />
              <div class="text-subtitle2">
                <q-btn @click="updateAnnouncement" round flat :icon="icon.mdiRefresh" />
              </div>
            </div>
          </q-item-section>
        </q-item>
        <q-item
          v-for="(announcement, index) in announcementList"
          :key="index"
          :to="{ name: 'AnnouncementDetail', params: { id: announcement.Id } }"
          clickable
          v-ripple
        >
          <q-item-section>
            <q-item-label class="text-subtitle1">
              [{{ announcement.Create.format('YYYY-MM-DD') }}] {{ announcement.Title }}
            </q-item-label>
            <q-item-label caption>
              {{ announcement.PreviewContent }}
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
  </q-page>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { getAnnouncementList } from 'src/services/context'
import { announcementListFormat, Announcement } from './announcementFormat'
import { icon } from 'assets/icon'

let announcementList = reactive<Announcement[]>([])
let size = 24

const scroll = ref(null)

// 滚动拉取数据
function onLoad(index, done) {
  const response = Promise.resolve(getAnnouncementList({ Page: index, Size: size }))
  response
    .then((res) => {
      // @ts-expect-error 不知道谁的问题
      announcementList.push(...announcementListFormat(res.Data))
      if (res.TotalPages == index) {
        // 无法再拉取
        scroll.value.stop()
      } else {
        done()
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const updateAnnouncement = () => {
  announcementList.splice(0)
  scroll.value.reset()
  scroll.value.resume()
  scroll.value.poll()
}
</script>

<style scoped lang="scss">
.title {
  max-width: 900px;
}
</style>
