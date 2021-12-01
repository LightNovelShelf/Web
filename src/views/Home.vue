<template>
  <div style="max-width: 1920px" class="mx-auto">
    <q-grid x-gap="12" y-gap="8" cols="2" sm="1" xs="1">
      <q-grid-item>
        <q-card>
          <q-card-section>
            <div class="row flex-center">
              <div class="text-h6">最近更新</div>
              <q-space />
              <div class="text-subtitle2">更多</div>
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
        <n-card v-if="onlineInfo" type="success" title="网站统计" style="margin-top: 12px">
          <n-row>
            <n-col :span="8">
              <n-statistic label="当前在线">{{ onlineInfo.OnlineCount }}</n-statistic>
            </n-col>
            <n-col :span="8">
              <n-statistic label="今日总数">{{ onlineInfo.DayCount }}</n-statistic>
            </n-col>
            <n-col :span="8">
              <n-statistic label="最高纪录">{{ onlineInfo.MaxOnline }}</n-statistic>
            </n-col>
          </n-row>
        </n-card>
      </q-grid-item>

      <q-grid-item>
        <q-grid cols="1" y-gap="12">
          <q-grid-item>
            <q-card>
              <q-card-section>
                <div class="row flex-center">
                  <div class="text-h6">公告</div>
                  <q-space />
                  <div class="text-subtitle2">更多</div>
                </div>
              </q-card-section>

              <q-separator />

              <q-list separator>
                <q-item clickable v-ripple>
                  <q-item-section>公告1</q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 公告2 </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 公告3 </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 公告4 </q-item-section>
                </q-item>
                <q-item clickable v-ripple>
                  <q-item-section> 公告5 </q-item-section>
                </q-item>
              </q-list>
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
        </q-grid>
      </q-grid-item>
    </q-grid>
  </div>
</template>

<script lang="tsx">
import { defineComponent, ref, onActivated } from 'vue'
import BookCard from '@/components/BookCard.vue'
import { icon } from '../plugins/naive-ui'
import { QGrid, QGridItem } from '@/plugins/quasar/components/'
import { OnlineInfo } from '@/services/context/type'
import { getOnlineInfo } from '@/services/context'

export default defineComponent({
  components: {
    QGridItem,
    QGrid,
    BookCard
  },
  setup() {
    const onlineInfo = ref<OnlineInfo>()
    const getInfo = async () => {
      onlineInfo.value = await getOnlineInfo()
    }
    onActivated(getInfo)

    return {
      onlineInfo,
      icon,
      bookData: [
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很短',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长很长很长长很长很长长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长长很长很长长很长很长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date(),
          Id: 381
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
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
