<template>
  <div style="max-width: 1920px" class="mx-auto">
    <q-grid x-gap="12" y-gap="8" cols="2" sm="1" xs="1">
      <q-grid-item>
        <q-card>
          <q-card-section>
            <div class="row flex-center">
              <div class="text-h6">最近更新</div>
              <q-space />
              <div class="text-subtitle2">
                <router-link :to="{ name: 'BookList', params: { page: 1 } }">更多</router-link>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-grid cols="3" x-gap="8" y-gap="8">
              <q-grid-item v-for="(book, index) in bookData" :key="index">
                <book-card :book="book" />
              </q-grid-item>
            </q-grid>
          </q-card-section>
        </q-card>

        <q-card v-if="onlineInfo" class="online" style="margin-top: 12px">
          <q-card-section>
            <div class="title text-h6">网站统计</div>
          </q-card-section>
          <q-card-section style="padding-top: 0">
            <div class="content row full-width">
              <div class="col-4">
                <div class="text-grey-7">当前在线</div>
                <div class="text-h6">{{ onlineInfo.OnlineCount }}</div>
              </div>
              <div class="col-4">
                <div class="text-grey-7">今日总数</div>
                <div class="text-h6">{{ onlineInfo.DayCount }}</div>
              </div>
              <div class="col-4">
                <div class="text-grey-7">最高纪录</div>
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

              <q-list v-if="announcementList" separator>
                <q-item
                  v-for="(announcement, index) in announcementList"
                  :key="index"
                  :to="{ name: 'AnnouncementDetail', params: { id: announcement.Id } }"
                  clickable
                  v-ripple
                >
                  <q-item-section>[{{ announcement.Create }}] {{ announcement.Title }}</q-item-section>
                </q-item>
              </q-list>
              <div v-else class="row flex-center" style="height: 250px">
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
                <q-item clickable v-ripple>
                  <q-item-section> 日志3 </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 日志4 </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 日志5 </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-grid-item>

          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">处刑列表</div>
                  <q-space />
                  <div class="text-subtitle2">更多</div>
                </div>
              </q-card-section>

              <q-separator />
              <q-card-section>
                <div>让我们期待一下哪位帅气的小哥哥能榜上有名呢</div>
              </q-card-section>
            </q-card>
          </q-grid-item>
        </q-grid>
      </q-grid-item>
    </q-grid>
  </div>
</template>

<script lang="tsx">
import { defineComponent, ref, onActivated } from 'vue'
import BookCard from '@/components/BookCard.vue'
import { icon } from '@/plugins/icon'
import { QGrid, QGridItem } from '@/plugins/quasar/components/'
import { OnlineInfo } from '@/services/context/type'
import { getOnlineInfo, getAnnouncementList } from '@/services/context'
import { announcementListFormat } from './Announcement/announcementFormat'

export default defineComponent({
  components: {
    QGridItem,
    QGrid,
    BookCard
  },
  setup() {
    const onlineInfo = ref<OnlineInfo>()
    const announcementList = ref<any[]>()
    const getInfo = async () => {
      onlineInfo.value = await getOnlineInfo()
      announcementList.value = announcementListFormat((await getAnnouncementList({ Page: 1, Size: 5 })).Data)
    }
    onActivated(getInfo)

    return {
      onlineInfo,
      announcementList,
      icon,
      bookData: [
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很短',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长很长很长长很长很长长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长长很长很长长很长很长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.lightnovel.app:45220/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长长很长很长长很长很长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        }
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
:deep(ul:first-child) {
  margin-top: 0;
}
</style>
