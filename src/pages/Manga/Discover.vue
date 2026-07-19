<template>
  <q-page padding class="manga-series-page q-mx-auto">
    <div class="top-bar">
      <q-select
        v-model="order"
        emit-value
        map-options
        filled
        dense
        :options="orderOptions"
        label="排序"
        class="order-select"
      />
    </div>

    <div v-if="mangas.length" class="series-grid">
      <router-link
        v-for="manga in mangas"
        :key="manga.id"
        class="series-card"
        :to="{ name: 'MangaDetail', params: { mangaId: manga.id } }"
      >
        <div class="cover-wrap">
          <manga-cover :manga="manga" compact />
          <span class="chapter-count">{{ manga.chapterCount }} 卷</span>
        </div>
        <div class="series-meta">
          <div class="series-title">
            <div class="series-title-text" :title="manga.title">{{ manga.title }}</div>
          </div>
          <div class="series-update-time">
            <manga-update-time :updated-at="manga.updatedAt" />
          </div>
        </div>
      </router-link>
    </div>
    <div v-else-if="!loading" class="empty-state text-grey-7">
      {{ loadError || '暂无漫画' }}
    </div>
    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import { getErrMsg } from 'src/utils/getErrMsg'

import { getComicList } from 'src/services/manga'

import type { MangaListItem } from './types'
import type { ComicOrder } from 'src/services/manga'

import MangaCover from './components/MangaCover.vue'
import MangaUpdateTime from './components/MangaUpdateTime.vue'
import { toMangaListItem } from './data'

const orderOptions: Array<{ label: string; value: ComicOrder }> = [
  { label: '最近更新', value: 'latest' },
  { label: '上架时间', value: 'new' },
  { label: '总点击量', value: 'view' },
]

const order = ref<ComicOrder>('latest')
const mangas = ref<MangaListItem[]>([])
const loading = ref(false)
const loadError = ref('')

watch(
  order,
  async () => {
    loading.value = true
    loadError.value = ''
    try {
      const response = await getComicList({ Page: 1, Size: 24, Order: order.value })
      mangas.value = response.Data.map(toMangaListItem)
    } catch (error) {
      mangas.value = []
      loadError.value = getErrMsg(error)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
@import 'src/css/mixin';

.manga-series-page {
  position: relative;
  width: 100%;
  max-width: 1920px;
  min-height: 320px;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.order-select {
  width: 160px;
}
.series-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 20px 12px;
  margin-top: 12px;
}
.series-card {
  min-width: 0;
  color: inherit;
}
.cover-wrap {
  position: relative;
  overflow: hidden;
  background: #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.cover-wrap :deep(.manga-cover) {
  aspect-ratio: 2 / 3;
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
.series-meta {
  padding: 4px;
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
.empty-state {
  display: grid;
  min-height: 240px;
  place-items: center;
}
@media (max-width: 1439px) {
  .series-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
@media (max-width: 1023px) {
  .series-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 599px) {
  .order-select {
    width: 140px;
  }
  .series-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px 8px;
  }
}
</style>
