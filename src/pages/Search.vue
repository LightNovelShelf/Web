<template>
  <q-page padding>
    <div class="column no-wrap gap-y-16">
      <div class="row flex-center">
        <search-input
          outlined
          dense
          :width="searchInputWidth"
          max-width="600px"
          v-model="searchInput"
          @search="onSearch"
        />
      </div>
      <div class="column no-wrap gap-y-16">
        <q-tabs dense v-model="tab" class="text-teal">
          <template v-for="option in tabOptions" :key="option.key">
            <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
          </template>
        </q-tabs>
        <paged-list :list="list" :item-key="itemKey">
          <template #item="{ item }">
            <book-card v-if="tab === 'Book'" :book="item as BookInList"></book-card>
            <router-link
              v-else
              class="series-card"
              :to="{ name: 'MangaInfo', params: { bid: (item as MangaListItem).bookId } }"
            >
              <div class="cover-wrap">
                <q-card class="overflow-hidden">
                  <manga-cover :manga="item as MangaListItem" :request-height="512" />
                </q-card>
                <span class="chapter-count">{{ (item as MangaListItem).chapterCount }} 话</span>
              </div>
              <div class="q-pa-xs">
                <div class="series-title">
                  <div class="series-title-text" :title="(item as MangaListItem).title">
                    {{ (item as MangaListItem).title }}
                  </div>
                </div>
                <div class="series-update-time">
                  <time-ago :value="(item as MangaListItem).updatedAt" />
                </div>
              </div>
            </router-link>
          </template>
          <template #empty>
            <div class="text-center text-h5">
              {{ tab === 'Comic' ? '无漫画搜索结果' : `无${modeLabel}搜索结果` }}
            </div>
          </template>
        </paged-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSettingStore } from '@/stores/setting'

import BookCard from '@/components/BookCard.vue'
import PagedList from '@/components/list/PagedList.vue'
import SearchInput from '@/components/SearchInput.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { usePagedList } from '@/composition/biz/usePagedList'
import { stringQuery, useQueryPatch, useQueryState } from '@/composition/biz/useQueryState'

import MangaCover from '@/pages/Manga/components/MangaCover.vue'
import { toMangaListItem } from '@/pages/Manga/data'
import {
  getBookList,
  getBookListByTitle,
  getBookListByAuthor,
  getBookListByName,
  getBookListByTags,
} from '@/services/book'
import { searchComicSeries } from '@/services/manga'

import type { MangaListItem } from '@/pages/Manga/types'
import type { BookInList, SearchMode } from '@/services/book/types'
import type { LocationQueryRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { generalSetting } = useSettingStore()

const keywordsCodec = stringQuery<string>('')
const modeCodec = stringQuery<SearchMode>('fuzzy', ['fuzzy', 'exact', 'title', 'author', 'name', 'tags'])

const keywords = useQueryState('keywords', keywordsCodec)
const mode = useQueryState('mode', modeCodec)
const tab = useQueryState('tab', stringQuery('Book', ['Book', 'Comic']))
const patchQuery = useQueryPatch()

// 旧 url 用 exact=1 表示精确搜索
if (route.query.exact !== undefined && route.query.mode === undefined) {
  const query: LocationQueryRaw = { ...route.query, mode: 'exact' }
  delete query.exact
  void router.replace({ query })
}

/** 搜索框自己的输入态，回车或选维度时才写进 query */
const searchInput = ref(keywords.value)
watch(keywords, (value) => (searchInput.value = value))

/** 关键词与维度一起写进 query：分两次赋值时后一次会读到未更新的 route.query，把前一次覆盖掉 */
function onSearch(value: string, searchMode: SearchMode) {
  patchQuery({ keywords: keywordsCodec.serialize(value), mode: modeCodec.serialize(searchMode), page: null })
}

const searchInputWidth = () => '60vw'

const modeLabelMap: Record<SearchMode, string> = {
  fuzzy: '',
  exact: '精确',
  title: '书名',
  author: '作者',
  name: '作品名',
  tags: '标签',
}
const modeLabel = computed(() => modeLabelMap[mode.value] ?? '')

const list = usePagedList<BookInList | MangaListItem>({
  async fetch(page) {
    const key = keywords.value
    if (!key) return { data: [], totalPages: 0 }

    const baseParam = {
      Page: page,
      Size: 24,
      IgnoreJapanese: generalSetting.ignoreJapanese,
      IgnoreAI: generalSetting.ignoreAI,
    }

    if (tab.value === 'Comic') {
      const res = await searchComicSeries({ ...baseParam, KeyWords: key, Mode: mode.value })
      return { data: res.Data.map(toMangaListItem), totalPages: res.TotalPages }
    }

    let res
    switch (mode.value) {
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
      default:
        res = await getBookList({ ...baseParam, KeyWords: key })
        break
    }

    return { data: res.Data, totalPages: res.TotalPages }
  },
  deps: () => [keywords.value, mode.value, tab.value],
})

const itemKey = (item: BookInList | MangaListItem) => ('Id' in item ? item.Id : item.id)

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
