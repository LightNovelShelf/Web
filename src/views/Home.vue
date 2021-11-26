<template>
  <div style="max-width: 80vw" class="mx-auto">
    <!-- 默认是1，容器超过600px变2 -->
    <n-grid :x-gap="12" :y-gap="8" responsive="screen" cols="1 m:2 l:2 xl:2 2xl:2">
      <n-grid-item>
        <n-card
          type="success"
          title="最近更新"
          :segmented="{
            content: 'hard',
            footer: 'soft'
          }"
          content-style="padding:0;"
        >
          <template #header-extra>
            <n-text depth="2" tag="div" style="display: flex; align-items: center; cursor: pointer">
              <b>更多</b>
              <q-icon :name="icon.mdiArrowRight" />
            </n-text>
          </template>
          <n-row>
            <n-col v-for="(book, index) in bookData" :key="index" :span="8" style="padding: 6px">
              <book-card :book="book"></book-card>
            </n-col>
          </n-row>
        </n-card>
        <n-card type="success" title="网站统计" style="margin-top: 12px">
          <n-row>
            <n-col :span="8">
              <n-statistic label="当前在线">114,514</n-statistic>
            </n-col>
            <n-col :span="8">
              <n-statistic label="今日总数">114,514</n-statistic>
            </n-col>
            <n-col :span="8">
              <n-statistic label="最高纪录">114,514</n-statistic>
            </n-col>
          </n-row>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <div>
          <n-list bordered>
            <template #header>
              <n-space justify="space-between" align="flex-end">
                <div style="font-size: 17px"><b>公告</b></div>
                <n-text depth="2" tag="div" style="display: flex; align-items: center; cursor: pointer">
                  <b>更多</b>
                  <q-icon :name="icon.mdiArrowRight" />
                </n-text>
              </n-space>
            </template>
            <n-list-item> 公告1 </n-list-item>
            <n-list-item> 公告2 </n-list-item>
            <n-list-item> 公告3 </n-list-item>
            <n-list-item> 公告4 </n-list-item>
            <n-list-item> 公告5 </n-list-item>
          </n-list>
          <n-list bordered>
            <template #header>
              <n-space justify="space-between">
                <div style="font-size: 17px"><b>更新日志</b></div>
                <n-text depth="2" tag="div" style="display: flex; align-items: center; cursor: pointer">
                  <b>更多</b>
                  <q-icon :path="icon.mdiArrowRight" />
                </n-text>
              </n-space>
            </template>
            <n-list-item> 日志1 </n-list-item>
            <n-list-item> 日志2 </n-list-item>
            <n-list-item> 日志3 </n-list-item>
            <n-list-item> 日志4 </n-list-item>
            <n-list-item> 日志5 </n-list-item>
          </n-list>
        </div>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import BookCard from '@/components/BookCard'
import { icon } from '../plugins/naive-ui'

export default defineComponent({
  components: {
    BookCard
  },
  setup() {
    return {
      icon,
      bookData: [
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很短',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长很长很长长很长很长长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/3c1312386f33.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长长很长很长长很长很长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
        },
        {
          Cover: 'https://img.acgdmzy.com:45112/images/2020/04/22/e5e2fca834ff.jpg',
          Title: '我是书名，我很长很长很长很长很长很长长很长很长长很长长长很长很长长很长很长很长长很长很长长很长很长',
          UserName: '无语',
          Category: {
            ShortName: '录入'
          },
          LastUpdateTime: new Date()
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
