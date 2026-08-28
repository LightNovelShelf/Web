<template>
  <q-page padding>
    <!-- 滚动加载 -->
    <q-infinite-scroll @load="onLoad" :offset="100" ref="scroll" :disable="currentIds.length === 0">
      <div class="column gap-y-16">
        <q-tabs dense v-model="tab" class="text-teal">
          <template v-for="option in tabOptions" :key="option.key">
            <q-tab :name="option.name" :icon="option.icon" :label="option.label" :disable="option.disable" />
          </template>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="Novel">
            <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
              <q-grid-item v-for="book in bookData.filter((x) => !!x)" :key="book['Id']">
                <book-card :book="book"></book-card>
              </q-grid-item>
            </q-grid>
          </q-tab-panel>
          <q-tab-panel name="Comic">
            <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
              <q-grid-item v-for="manga in comicData" :key="manga.id">
                <router-link class="series-card" :to="{ name: 'MangaDetail', params: { seriesTitle: manga.id } }">
                  <div class="cover-wrap">
                    <q-card class="overflow-hidden">
                      <manga-cover :manga="manga" :request-height="512" />
                    </q-card>
                    <span class="chapter-count">{{ manga.chapterCount }} 话</span>
                  </div>
                  <div class="q-pa-xs">
                    <div class="series-title">
                      <div class="series-title-text" :title="manga.title">{{ manga.title }}</div>
                    </div>
                    <div class="series-update-time">
                      <time-ago :value="manga.updatedAt" />
                    </div>
                  </div>
                </router-link>
              </q-grid-item>
            </q-grid>
          </q-tab-panel>
          <q-tab-panel name="Thread"></q-tab-panel>
        </q-tab-panels>
      </div>
      <q-page-sticky position="bottom-right" :offset="fabPos" style="z-index: 1">
        <q-btn round color="primary" size="md" icon="mdiDelete" @click="showConfirm = true" />
      </q-page-sticky>
      <q-dialog v-model="showConfirm">
        <q-card style="min-width: 200px">
          <q-card-section class="row items-center">是否清空阅读历史</q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="清空" color="primary" v-close-popup @click="confirmClear" />
            <q-btn flat label="取消" color="primary" v-close-popup @click="showConfirm = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { noop } from '@vueuse/core'
import { ref, defineComponent, computed, watch } from 'vue'

import BookCard from '@/components/BookCard.vue'
import { QGrid, QGridItem } from '@/components/grid'
import TimeAgo from '@/components/TimeAgo.vue'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import MangaCover from '@/pages/Manga/components/MangaCover.vue'
import { toMangaListItem } from '@/pages/Manga/data'
import { getBookListByIds, getComicSeriesByIds } from '@/services/book'
import { getReadHistory, clearHistory } from '@/services/user'

import type { MangaListItem } from '@/pages/Manga/types'
import type { BookInList } from '@/services/book/types'

defineComponent({ QGrid, QGridItem })

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Novel',
    key: 'Novel',
    label: '小说',
    disable: false,
    icon: 'mdiBook',
  },
  {
    name: 'Comic',
    key: 'Comic',
    label: '漫画',
    disable: false,
    icon: 'mdiBookMultiple',
  },
  {
    name: 'Thread',
    key: 'Thread',
    label: '帖子',
    disable: true,
    icon: 'mdiForum',
  },
]

const fabPos = ref([18, 18])
const tab = ref('Novel')
const bookData = ref<BookInList[]>([])
const comicData = ref<MangaListItem[]>([])
const novelIds = ref<number[]>([])
const comicIds = ref<number[]>([])
/** 漫画按系列去重：跨页记录已展示的系列名 */
const seenSeries = ref<Set<string>>(new Set())
const showConfirm = ref(false)
const size = 24
const scroll = ref(null)

/** 当前 tab 对应的历史 id 列表，驱动无限滚动的启停 */
const currentIds = computed(() => (tab.value === 'Comic' ? comicIds.value : novelIds.value))
const totalPages = computed(() => Math.ceil(currentIds.value.length / size) || 1)

const confirmClear = async () => {
  await clearHistory()
    .then(() => {
      bookData.value = []
      comicData.value = []
    })
    // FIXME: 确认这个catch是干什么用的，是想真的catch error还是只是调试用
    .catch(noop)
}

const requestHistory = useTimeoutFn(async () => {
  await getReadHistory()
    .then((res) => {
      if (res) {
        novelIds.value = res.Novel ?? []
        comicIds.value = res.Comic ?? []
        scroll.value.resume()
        scroll.value.poll()
      }
    })
    // FIXME: 确认这个catch是干什么用的，是想真的catch error还是只是调试用
    .catch(noop)
})

const resetScroll = () => {
  bookData.value = []
  comicData.value = []
  seenSeries.value = new Set()
  scroll.value?.reset()
}

useInitRequest(requestHistory, { before: resetScroll })

// 切换 tab 时重置滚动状态并按新 tab 重新拉取
watch(tab, () => {
  resetScroll()
  scroll.value?.resume()
  scroll.value?.poll()
})

const loadNovel = async (index: number, done: (stop?: boolean) => void) => {
  const res = await getBookListByIds(novelIds.value.slice((index - 1) * size, index * size))
  bookData.value.push(...res)
  if (index >= totalPages.value) scroll.value.stop()
  else done()
}

const loadComic = async (index: number, done: (stop?: boolean) => void) => {
  const ids = comicIds.value.slice((index - 1) * size, index * size)
  // 后端按系列聚合返回；跨页可能出现同系列，用 seen 去重
  const res = await getComicSeriesByIds(ids)
  for (const card of res.Data.map(toMangaListItem)) {
    if (seenSeries.value.has(card.id)) continue
    seenSeries.value.add(card.id)
    comicData.value.push(card)
  }
  if (index >= totalPages.value) scroll.value.stop()
  else done()
}

// 滚动拉取数据
const onLoad = async (index: number, done: (stop?: boolean) => void) => {
  const load = tab.value === 'Comic' ? loadComic : loadNovel
  await load(index, done).catch(noop)
}
</script>

<style scoped lang="scss">
@import '@/css/mixin';

.series-card {
  color: inherit;
}
.cover-wrap {
  position: relative;
}
.cover-wrap :deep(.manga-cover) {
  transition: transform 0.25s ease;
}
.series-card:hover :deep(.manga-cover) {
  transform: scale(1.025);
}
.chapter-count {
  position: absolute;
  top: 8px;
  right: 0;
  padding: 1px 7px 1px 9px;
  color: #fff;
  background: #1976d2;
  border-radius: 1em 0 0 1em;
  font-size: 12px;
}
.series-title {
  display: flex;
  align-items: flex-start;
  height: calc(var(--font-size) * var(--line-height) * 2);
  font-size: var(--font-size);
  line-height: var(--line-height);
  --font-size: 12px;
  --line-height: 1.6;
}
.series-title-text {
  @include ellipsis(2);
}
.series-update-time {
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  opacity: 0.6;
}
</style>
