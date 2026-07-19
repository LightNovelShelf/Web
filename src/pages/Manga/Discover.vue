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

    <div class="series-grid">
      <router-link
        v-for="manga in sortedMangas"
        :key="manga.id"
        class="series-card"
        :to="{ name: 'MangaDetail', params: { mangaId: manga.id } }"
      >
        <div class="cover-wrap">
          <manga-cover :manga="manga" compact />
          <span class="chapter-count">{{ manga.chapters.length }} 话</span>
        </div>
        <div class="series-title" :title="manga.title">{{ manga.title }}</div>
        <div class="series-update-time">
          <manga-update-time :updated-at="manga.updatedAt" />
        </div>
      </router-link>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import MangaCover from './components/MangaCover.vue'
import MangaUpdateTime from './components/MangaUpdateTime.vue'
import { mangas } from './mock'

type MangaOrder = 'latest' | 'new' | 'view'

const orderOptions: Array<{ label: string; value: MangaOrder }> = [
  { label: '最近更新', value: 'latest' },
  { label: '上架时间', value: 'new' },
  { label: '总点击量', value: 'view' },
]

const seriesStats: Record<string, { createdAt: string; updatedAt: string; views: number }> = {
  'night-train': { createdAt: '2026-01-10', updatedAt: '2026-07-18', views: 1280000 },
  'summer-echo': { createdAt: '2025-05-16', updatedAt: '2026-06-20', views: 860000 },
  'blade-bloom': { createdAt: '2025-11-08', updatedAt: '2026-07-19', views: 1020000 },
  'cloud-cafe': { createdAt: '2026-03-22', updatedAt: '2026-07-14', views: 640000 },
  'zero-city': { createdAt: '2026-02-02', updatedAt: '2026-07-17', views: 1110000 },
  'fox-letter': { createdAt: '2025-08-12', updatedAt: '2026-05-30', views: 1530000 },
}

const order = ref<MangaOrder>('latest')
const sortedMangas = computed(() =>
  [...mangas].sort((left, right) => {
    const leftStats = seriesStats[left.id]
    const rightStats = seriesStats[right.id]
    if (order.value === 'view') return rightStats.views - leftStats.views
    if (order.value === 'new') return rightStats.createdAt.localeCompare(leftStats.createdAt)
    return rightStats.updatedAt.localeCompare(leftStats.updatedAt)
  }),
)
</script>

<style lang="scss" scoped>
.manga-series-page {
  width: 100%;
  max-width: 1920px;
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
.series-title {
  display: -webkit-box;
  height: 38px;
  margin: 6px 4px 0;
  overflow: hidden;
  font-size: 12px;
  line-height: 19px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.series-update-time {
  height: 18px;
  margin: 2px 4px 0;
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  opacity: 0.6;
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
