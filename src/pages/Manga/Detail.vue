<template>
  <q-page padding class="manga-detail q-mx-auto">
    <q-card flat bordered>
      <q-card-section>
        <div class="detail-layout">
          <div>
            <div class="cover-column">
              <q-card class="cover-card">
                <manga-cover :manga="manga" />
                <div class="absolute-bottom bottom-shadow q-pa-sm text-white">
                  <div class="row items-center">
                    <div class="row items-center cover-stat">
                      <q-icon size="22px" name="mdiHeart" />
                      <span>{{ manga.followers }}</span>
                    </div>
                    <q-space />
                    <div class="row items-center cover-stat">
                      <q-icon size="22px" name="mdiEye" />
                      <span>{{ manga.views }}</span>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>

          <div>
            <h1 class="text-subtitle1 text-weight-bold q-my-none">《{{ manga.title }}》</h1>

            <div class="info-lines q-mt-lg text-caption">
              <div>作者：{{ manga.author }}</div>
              <div>系列名：{{ manga.subtitle }}</div>
              <div>系列中文名：{{ manga.title }}</div>
              <div>最后更新：{{ manga.latestUpdate }}</div>
              <div>更新时间：{{ dateFormat(manga.updatedAt) }} ({{ updatedAtDesc }})</div>
              <div>上次阅读：{{ lastReadText }}</div>
            </div>

            <div class="row tag-list q-mt-md">
              <q-chip v-for="tag in manga.tags" :key="tag" dense outline color="primary">{{ tag }}</q-chip>
            </div>

            <div class="text-subtitle2 q-mt-lg q-mb-xs">简介</div>
            <p class="description text-caption text-grey-7">{{ manga.description }}</p>

            <div class="row items-center action-list q-mt-lg">
              <q-btn color="primary" :label="progress[manga.id] ? '继续阅读' : '开始阅读'" :to="readerRoute" />
              <q-btn outline color="primary" label="追漫" disable />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="q-mt-md">
      <q-card-section class="row items-center">
        <div>
          <div class="text-h6">章节列表</div>
          <div class="text-caption text-grey-7">共 {{ manga.chapters.length }} 话</div>
        </div>
        <q-space />
        <q-btn flat dense no-caps :label="ascending ? '正序' : '倒序'" @click="ascending = !ascending" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="chapter-grid">
          <q-item
            v-for="chapter in sortedChapters"
            :key="chapter.id"
            clickable
            v-ripple
            bordered
            class="chapter-item rounded-borders"
            :active="progress[manga.id]?.chapterId === chapter.id"
            active-class="bg-primary text-white"
            :to="{ name: 'MangaReader', params: { mangaId: manga.id, chapterId: chapter.id } }"
          >
            <q-item-section avatar>
              <q-avatar color="grey-3" text-color="grey-8" size="36px">{{ chapter.number }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ chapter.title }}</q-item-label>
              <q-item-label caption>{{ chapter.publishedAt }} · {{ chapter.pages }}P</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-card-section>
    </q-card>

    <comment class="q-mt-md" :type="CommentType.Book" :id="4140" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { parseTime } from 'src/utils/time'

import { Comment } from 'components'

import { useToNowRef } from 'src/composition/useToNowRef'

import { CommentType } from 'src/services/comment/types'

import MangaCover from './components/MangaCover.vue'
import { getManga } from './mock'
import { useMangaLibrary } from './useMangaLibrary'

const props = defineProps<{ mangaId: string }>()
const ascending = ref(true)
const { progress } = useMangaLibrary()

const manga = computed(() => getManga(props.mangaId))
const savedChapter = computed(() =>
  manga.value.chapters.find((chapter) => chapter.id === progress.value[manga.value.id]?.chapterId),
)
const lastReadText = computed(() => {
  const page = progress.value[manga.value.id]?.page
  return savedChapter.value && page != null ? `${savedChapter.value.title} · 第 ${page} 页` : '暂无'
})
const updatedAtDesc = useToNowRef(() => manga.value.updatedAt)
const sortedChapters = computed(() => (ascending.value ? manga.value.chapters : [...manga.value.chapters].reverse()))
const readerRoute = computed(() => ({
  name: 'MangaReader',
  params: {
    mangaId: manga.value.id,
    chapterId: savedChapter.value?.id ?? manga.value.chapters[0].id,
  },
}))

function dateFormat(time: string) {
  return parseTime(time).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.manga-detail {
  width: 100%;
  max-width: 1440px;
}
.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
}
.cover-stat,
.tag-list {
  gap: 4px;
}
.action-list {
  gap: 16px;
}
.cover-column {
  width: 100%;
}
.cover-card {
  overflow: hidden;
}
.cover-card :deep(.manga-cover) {
  aspect-ratio: 2 / 3;
}
.bottom-shadow {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.86), transparent);
}
.description {
  max-width: 820px;
  margin: 0;
  line-height: 1.6;
}
.info-lines {
  line-height: 1.65;
}
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.chapter-item {
  min-width: 0;
  border: 1px solid rgba(127, 127, 127, 0.28);
}
.chapter-item :deep(.q-item__section--avatar) {
  min-width: 44px;
}
.chapter-item.q-item--active :deep(.q-avatar) {
  color: var(--q-primary) !important;
}
.chapter-item.q-item--active :deep(.q-item__label--caption) {
  color: rgba(255, 255, 255, 0.82) !important;
}
@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chapter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 599px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .chapter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
