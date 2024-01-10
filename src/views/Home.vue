<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <q-grid x-gap="12" y-gap="8" cols="2" sm="1" xs="1">
      <q-grid-item>
        <q-card>
          <q-card-section>
            <div class="row flex-center">
              <div class="text-h6">最近更新</div>
              <q-space />
              <div class="text-subtitle2">
                <router-link :to="{ name: 'BookList', params: { page: 1, order: 'latest' } }">更多</router-link>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="loading" style="height: 572px" class="row flex-center">
              <q-spinner color="primary" size="40px" />
            </div>
            <q-grid v-else cols="3" x-gap="8" y-gap="8">
              <q-grid-item v-for="(book, index) in bookData" :key="index">
                <book-card :book="book" />
              </q-grid-item>
            </q-grid>
          </q-card-section>
        </q-card>

        <q-card class="online" style="margin-top: 12px">
          <q-card-section>
            <div class="title text-h6">网站统计</div>
          </q-card-section>
          <div v-if="loading" class="row flex-center" style="height: 70px; padding-top: 0">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          <q-card-section v-else style="padding-top: 0">
            <div class="content row full-width">
              <div class="col-3">
                <div class="text-opacity">当前在线</div>
                <div class="text-h6">{{ onlineInfo.OnlineCount }}</div>
              </div>
              <div class="col-3">
                <div class="text-opacity">今日总数</div>
                <div class="text-h6">{{ onlineInfo.DayCount }}</div>
              </div>
              <div class="col-3">
                <div class="text-opacity">今日注册</div>
                <div class="text-h6">{{ onlineInfo.DayRegister }}</div>
              </div>
              <div class="col-3">
                <div class="text-opacity">最高在线</div>
                <div class="text-h6">{{ onlineInfo.MaxOnline }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-grid-item>

      <q-grid-item>
        <q-grid cols="1" y-gap="12">
          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">公告</div>
                  <q-space />
                  <div class="text-subtitle2">
                    <router-link :to="{ name: 'Announcement' }">更多</router-link>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-list v-if="!loading" separator>
                <q-item
                  v-for="(announcement, index) in announcementList"
                  :key="index"
                  :to="{ name: 'AnnouncementDetail', params: { id: announcement.Id } }"
                  clickable
                  v-ripple
                >
                  <q-item-section>
                    [{{ announcement.Create.format('YYYY-MM-DD') }}] {{ announcement.Title }}
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="row flex-center" style="height: 240px">
                <q-spinner color="primary" size="40px" />
              </div>
            </q-card>
          </q-grid-item>

          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">更新日志</div>
                  <q-space />
                  <div class="text-subtitle2">更多</div>
                </div>
              </q-card-section>

              <q-separator />

              <q-list separator>
                <q-item clickable v-ripple>
                  <q-item-section>日志1</q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 日志2 </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-grid-item>

          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">友情链接</div>
                  <q-space />
                </div>
              </q-card-section>

              <q-separator />
              <q-card-section>
                <p>如有意向交换站点链接，请联系&nbsp;<a href="mailto:admin@acgdmzy.com">admin@acgdmzy.com</a></p>
              </q-card-section>
            </q-card>
          </q-grid-item>

          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">处刑列表</div>
                  <q-space />
                </div>
              </q-card-section>

              <q-separator />
              <q-card-section>
                <div v-if="loading" class="row flex-center">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
                <div v-else>
                  <q-avatar
                    class="cursor-pointer"
                    v-for="ban in banList"
                    :key="ban.Id"
                    size="32px"
                    @click="showImage(ban.Images)"
                  >
                    <img :src="ban.Avatar" alt="avatar" />
                    <q-tooltip class="ban-tooltip">
                      {{ ban.Description }}
                    </q-tooltip>
                  </q-avatar>
                </div>
              </q-card-section>
            </q-card>
          </q-grid-item>
        </q-grid>
      </q-grid-item>
    </q-grid>
    <div ref="viewerRef" v-viewer="{ navbar: true, rebuild: true }" v-show="false">
      <img v-for="img in banImages" :key="img" :src="img" alt="" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'src/components/grid/'
import { OnlineInfo } from 'src/services/context/type'
import { getOnlineInfo, getAnnouncementList, getBanInfoList } from 'src/services/context'
import { announcementListFormat } from './Announcement/announcementFormat'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { getLatestBookList } from 'src/services/book'
import { BookInList } from 'src/services/book/types'
import { useSettingStore } from 'src/stores/setting'

const onlineInfo = ref<OnlineInfo>()
const announcementList = ref<any[]>()
const bookData = ref<BookInList[]>()
const banList = ref<any[]>()
const banImages = ref<string[]>()
const viewerRef = ref<any>()
const settingStore = useSettingStore()
const getInfo = useTimeoutFn(async () => {
  // 这样可以使Signalr在一个ws消息中并发调用
  let p1 = getOnlineInfo().then((res) => (onlineInfo.value = res))
  let p2 = getAnnouncementList({ Page: 1, Size: 5 }).then(
    (res) => (announcementList.value = announcementListFormat(res.Data))
  )
  let p3 = getLatestBookList().then((res) => (bookData.value = res.Data))
  let p4 = getBanInfoList().then((res: any[]) => (banList.value = res))
  await Promise.all([p1, p2, p3, p4])
})
const loading = computed(() => getInfo.loading.value || !(onlineInfo.value || announcementList.value || banList.value))

const showImage = (img) => {
  banImages.value = img
  let viewer = viewerRef.value.$viewer
  viewer.show()
  viewer.view(0)
}

useInitRequest(getInfo)
</script>

<style lang="scss" scoped>
:global(.ban-tooltip) {
  max-width: unset !important;
}
</style>
