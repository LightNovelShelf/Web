<template>
  <q-page padding>
    <!-- todo 不懂他为什么不能放在q-tab-panel里面 -->
    <q-infinite-scroll @load="onLoad" :offset="100" ref="scrollEleInstanceRef">
      <template #default>
        <div class="q-gutter-y-md">
          <div class="row flex-center">
            <!-- <q-input rounded outlined dense v-model="searchKey" @keyup.enter="search" /> -->
            <search-input
              outlined
              dense
              :width="searchInputWidth"
              max-width="600px"
              v-model="state.searchKey"
              @search="onSearch"
            />
          </div>
          <div class="q-gutter-y-md">
            <q-tabs dense v-model="state.tab" class="text-teal" @update:model-value="onTabChange">
              <template v-for="option in tabOptions" :key="option.key">
                <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
              </template>
            </q-tabs>
            <q-tab-panels v-model="state.tab" animated>
              <q-tab-panel name="Book">
                <template v-if="state.bookData.length">
                  <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
                    <q-grid-item v-for="book in state.bookData" :key="book['Id']">
                      <book-card :book="book"></book-card>
                    </q-grid-item>
                  </q-grid>
                </template>
                <template v-else-if="!state.loading">
                  <div class="row justify-center q-my-md text-center text-h5">无{{ modeLabel }}搜索结果</div>
                </template>
              </q-tab-panel>
              <q-tab-panel name="Comic">
                <template v-if="state.comicData.length">
                  <q-grid :x-gap="12" :y-gap="20" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
                    <q-grid-item v-for="manga in state.comicData" :key="manga.id">
                      <router-link
                        class="series-card"
                        :to="{ name: 'MangaDetail', params: { seriesTitle: manga.id } }"
                      >
                        <div class="cover-wrap">
                          <q-card class="overflow-hidden">
                            <manga-cover :manga="manga" />
                          </q-card>
                          <span class="chapter-count">{{ manga.chapterCount }} 话</span>
                        </div>
                        <div class="q-pa-xs">
                          <div class="series-title">
                            <div class="series-title-text" :title="manga.title">{{ manga.title }}</div>
                          </div>
                          <div class="series-update-time">
                            <manga-update-time :updated-at="manga.updatedAt" />
                          </div>
                        </div>
                      </router-link>
                    </q-grid-item>
                  </q-grid>
                </template>
                <template v-else-if="!state.loading">
                  <div class="row justify-center q-my-md text-center text-h5">无漫画搜索结果</div>
                </template>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </template>
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useSettingStore } from 'src/stores/setting'

import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'components/grid'
import SearchInput from 'components/SearchInput.vue'

import MangaCover from 'src/pages/Manga/components/MangaCover.vue'
import MangaUpdateTime from 'src/pages/Manga/components/MangaUpdateTime.vue'
import { toMangaListItem } from 'src/pages/Manga/data'
import {
  getBookList,
  getBookListByTitle,
  getBookListByAuthor,
  getBookListByName,
  getBookListByTags,
} from 'src/services/book'
import { searchComicSeries } from 'src/services/manga'

import type { MangaListItem } from 'src/pages/Manga/types'
import type { SearchMode } from 'src/services/book/types'


const router = useRouter()
const route = useRoute()
const { generalSetting } = useSettingStore()
const scrollEleInstanceRef = ref<null | {
  stop(): void
  reset(): void
  resume(): void
  poll(): void
}>(null)
const state = ref({
  // 部分组件会在setup初始化，所以不能等 onMounted 等周期再对state内容初始化
  /** 搜索关键词 @description 用户输入是啥就是啥 */
  searchKey: '' + (route.query?.keywords ?? ''),
  /** 搜索维度 @description 兼容旧 url 的 exact 参数 */
  mode: ((route.query?.mode as SearchMode) || (route.query?.exact ? 'exact' : 'fuzzy')) as SearchMode,

  /** 当前tab @description 来源页为漫画相关页面时 url 带 tab=Comic，其余默认小说 */
  tab: route.query?.tab === 'Comic' ? 'Comic' : 'Book',

  /** 书籍数据 */
  bookData: [],

  /** 漫画系列数据（按系列聚合） */
  comicData: [] as MangaListItem[],

  /** 搜索结果加载态 @TODO: 使用 useRequest 代替手动管理 */
  loading: false,
})

const searchInputWidth = () => '60vw'

/** 各搜索维度对应的 service 调用 */
const modeLabelMap: Record<SearchMode, string> = {
  fuzzy: '',
  exact: '精确',
  title: '书名',
  author: '作者',
  name: '作品名',
  tags: '标签',
}
const modeLabel = computed(() => modeLabelMap[state.value.mode] ?? '')

const requestBook = async (index: number, done: (stop?: boolean) => void) => {
  state.value.loading = true
  try {
    const key = state.value.searchKey
    const baseParam = {
      Page: index,
      Size: 24,
      IgnoreJapanese: generalSetting.ignoreJapanese,
      IgnoreAI: generalSetting.ignoreAI,
    }

    let res
    switch (state.value.mode) {
      case 'title':
        res = await getBookListByTitle({ ...baseParam, KeyWords: key })
        break
      case 'author':
        res = await getBookListByAuthor({ ...baseParam, KeyWords: key })
        break
      case 'name':
        res = await getBookListByName({ ...baseParam, KeyWords: key })
        break
      case 'tags':
        res = await getBookListByTags({ ...baseParam, KeyWords: key })
        break
      case 'exact':
        res = await getBookList({ ...baseParam, KeyWords: `"${key}"` })
        break
      default: // fuzzy
        res = await getBookList({ ...baseParam, KeyWords: key })
        break
    }

    state.value.bookData.push(...res.Data)
    if (res.TotalPages === index || res.TotalPages === 0) scrollEleInstanceRef.value.stop()
    else done()
  } finally {
    state.value.loading = false
  }
}

/** 漫画系列搜索：沿用 book 搜索维度（mode），结果按系列聚合展示 */
const requestComic = async (index: number, done: (stop?: boolean) => void) => {
  state.value.loading = true
  try {
    const res = await searchComicSeries({
      KeyWords: state.value.searchKey,
      Mode: state.value.mode,
      Page: index,
      Size: 24,
      IgnoreJapanese: generalSetting.ignoreJapanese,
      IgnoreAI: generalSetting.ignoreAI,
    })

    state.value.comicData.push(...res.Data.map(toMangaListItem))
    if (res.TotalPages === index || res.TotalPages === 0) scrollEleInstanceRef.value.stop()
    else done()
  } finally {
    state.value.loading = false
  }
}

/** 按当前 tab 分发无限滚动加载 */
const onLoad = (index: number, done: (stop?: boolean) => void) => {
  if (state.value.tab === 'Comic') return requestComic(index, done)
  return requestBook(index, done)
}

function onSearch(val: string, mode: SearchMode) {
  state.value.searchKey = val
  state.value.mode = mode

  // sync state to url, so it can restore after refresh
  router.replace({ name: 'Search', query: { keywords: val, mode, tab: state.value.tab } })

  triggerSearchReq()
}

/** 用户点击切换 tab：同步 url 并按当前关键词在新维度重新搜索 */
function onTabChange(tab: string) {
  router.replace({ name: 'Search', query: { keywords: state.value.searchKey, mode: state.value.mode, tab } })
  triggerSearchReq()
}

/** 重新初始化搜素 */
function triggerSearchReq() {
  const instance = scrollEleInstanceRef.value
  if (!instance) {
    return
  }

  instance.reset()
  instance.resume()
  // 通过 q-infinite-scroll 的 poll 方法来触发加载
  instance.poll()

  // 数组在这重置还有一层用意：触发滚动容器回调；poll调用后理应就会触发回调，但实际情况并非如此
  // TODO: 探明滚动容器触发条件
  state.value.bookData.length = 0
  state.value.comicData.length = 0
}

/** 从url上提取搜索关键词，触发请求 @idempotent 对外幂等 */
function tryResyncSearchStateFromUrl(toRoute = route) {
  const keyword = '' + (toRoute.query?.keywords ?? '')
  const mode = ((toRoute.query?.mode as SearchMode) || (toRoute.query?.exact ? 'exact' : 'fuzzy')) as SearchMode
  const tab = toRoute.query?.tab === 'Comic' ? 'Comic' : 'Book'

  const isSameSearchQuery =
    keyword === state.value.searchKey && mode === state.value.mode && tab === state.value.tab
  // 搜索条件对比url上的没变就不再触发
  if (isSameSearchQuery) return

  state.value.searchKey = keyword
  state.value.mode = mode
  state.value.tab = tab
  triggerSearchReq()
}

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Book',
    key: 'Book',
    label: '小说',
    icon: 'mdiBook',
    disable: false,
  },
  {
    name: 'Comic',
    key: 'Comic',
    label: '漫画',
    icon: 'mdiBookMultiple',
    disable: false,
  },
]

// 初始化
onMounted(tryResyncSearchStateFromUrl)
onActivated(tryResyncSearchStateFromUrl)
onBeforeRouteUpdate(tryResyncSearchStateFromUrl)
</script>

<style scoped lang="scss">
@import 'src/css/mixin';

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
