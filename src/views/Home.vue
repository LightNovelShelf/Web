<template>
  <div style="margin: 0 auto; max-width: 80vw">
    <!-- 默认是1，容器超过600px变2 -->
    <n-grid :x-gap="12" :y-gap="8" cols="1 600:2">
      <n-grid-item>
        <n-card
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
              <n-icon>
                <KeyboardArrowRightFilled />
              </n-icon>
            </n-text>
          </template>
          <n-row>
            <n-col v-for="(book, index) in bookData" :key="index" :span="8" style="padding: 6px">
              <n-card content-style="padding: 3px;">
                <template #cover>
                  <div
                    :style="{
                      paddingBottom: '150%',
                      backgroundImage: `url('${book.cover}')`,
                      backgroundSize: 'cover'
                    }"
                  >
                  </div>
                </template>
                <div class="book-name">
                  <n-ellipsis :line-clamp="2">
                    {{ book.name }}
                  </n-ellipsis>
                </div>
              </n-card>
            </n-col>
          </n-row>
        </n-card>
        <n-card title="网站统计" style="margin-top: 12px">
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
                  <n-icon>
                    <KeyboardArrowRightFilled />
                  </n-icon>
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
                  <n-icon>
                    <KeyboardArrowRightFilled />
                  </n-icon>
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
import { icon } from '../plugins/naive-ui'

export default defineComponent({
  components: icon,
  setup() {
    return {
      bookData: [
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很短'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/780cd596dc21.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
        },
        {
          cover: 'https://neptune.noire.cc:233/images/2021/08/22/16d63ec3cae1.md.webp',
          name: '我是书名，我很长很长很长很长很长很长长很长很长长很长很长长很长很长长很长很长'
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

.book-name {
  display: flex;
  align-items: center;
  height: calc(var(--font-size) * var(--line-height) * 2);
}
</style>
