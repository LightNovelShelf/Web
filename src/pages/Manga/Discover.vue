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

    <q-grid
      v-if="mangas.length"
      :x-gap="12"
      :y-gap="20"
      cols="6"
      xs="3"
      sm="4"
      md="5"
      lg="6"
      xl="6"
      style="margin-top: 12px"
    >
      <q-grid-item v-for="manga in mangas" :key="manga.id">
        <router-link class="series-card" :to="{ name: 'MangaDetail', params: { mangaId: manga.id } }">
          <div class="cover-wrap">
            <q-card class="overflow-hidden">
              <manga-cover :manga="manga" />
            </q-card>
            <span class="status-tag" :style="{ backgroundColor: manga.status.color }">{{ manga.status.name }}</span>
            <span class="chapter-count">{{ manga.chapterCount }}话</span>
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
    <div v-else-if="!loading" class="row items-center justify-center text-grey-7" style="min-height: 240px">
      {{ loadError || '暂无漫画' }}
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

import { getErrMsg } from 'src/utils/getErrMsg'

import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

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

const $q = useQuasar()
const order = ref<ComicOrder>('latest')
const mangas = ref<MangaListItem[]>([])
const loadError = ref('')

const request = useTimeoutFn(async () => {
  loadError.value = ''
  try {
    const response = await getComicList({ Page: 1, Size: 24, Order: order.value })
    mangas.value = response.Data.map(toMangaListItem)
  } catch (error) {
    mangas.value = []
    loadError.value = getErrMsg(error)
  }
})
const loading = request.loading

watch(loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) $q.loadingBar.start()
})
watch(order, () => void request())
useInitRequest(request)
</script>

<style lang="scss" scoped>
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
.status-tag {
  position: absolute;
  top: 8px;
  left: 0;
  padding: 1px 9px 1px 7px;
  color: #fff;
  border-radius: 0 1em 1em 0;
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
