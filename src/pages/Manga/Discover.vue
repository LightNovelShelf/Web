<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div class="row justify-end">
      <q-select
        v-model="order"
        :disable="loading"
        emit-value
        map-options
        filled
        dense
        :options="orderOptions"
        label="排序"
        style="width: 160px"
      />
    </div>

    <paged-list :list="list" :item-key="(manga) => manga.id">
      <template #item="{ item: manga }">
        <router-link class="series-card" :to="{ name: 'MangaInfo', params: { bid: manga.bookId } }">
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
      </template>
      <template #empty>暂无漫画</template>
    </paged-list>
  </q-page>
</template>

<script lang="ts" setup>
import PagedList from '@/components/list/PagedList.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { usePagedList } from '@/composition/biz/usePagedList'
import { stringQuery, useQueryState } from '@/composition/biz/useQueryState'

import { getComicList } from '@/services/manga'

import MangaCover from './components/MangaCover.vue'
import { toMangaListItem } from './data'

import type { MangaListItem } from './types'
import type { ComicOrder } from '@/services/manga'

const orderOptions: Array<{ label: string; value: ComicOrder }> = [
  { label: '最近更新', value: 'latest' },
  { label: '上架时间', value: 'new' },
  { label: '总点击量', value: 'view' },
]

const order = useQueryState('order', stringQuery<ComicOrder>('latest', ['latest', 'new', 'view'] as const))

const list = usePagedList<MangaListItem>({
  fetch: async (page) => {
    const response = await getComicList({ Page: page, Size: 24, Order: order.value })
    return { data: response.Data.map(toMangaListItem), totalPages: response.TotalPages }
  },
  deps: () => order.value,
})
const loading = list.loading
</script>

<style lang="scss" scoped>
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
