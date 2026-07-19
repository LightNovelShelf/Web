<template>
  <q-page padding class="manga-detail q-mx-auto">
    <template v-if="isActive">
      <q-card>
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
              <p class="description">{{ manga.description }}</p>

              <div class="row items-center action-list q-mt-lg">
                <q-btn color="primary" :label="progress[manga.id] ? '继续阅读' : '开始阅读'" :to="readerRoute" />
                <q-btn outline color="primary" label="追漫" disable />
              </div>
            </div>
          </div>
          <div class="row items-center chapter-header">
            <div>
              <div class="text-h6">章节列表</div>
              <div class="text-caption text-grey-7">共 {{ manga.chapters.length }} 话</div>
            </div>
            <q-space />
            <q-btn flat dense no-caps :label="ascending ? '正序' : '倒序'" @click="ascending = !ascending" />
          </div>
          <q-separator />
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
                <q-item-label caption>{{ chapterDateFormat(chapter.publishedAt) }} · {{ chapter.pages }}P</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>

      <comment class="q-mt-md" :type="CommentType.Book" :id="Number(manga.id)" />
    </template>
    <div v-else-if="loadError" class="detail-state text-negative">{{ loadError }}</div>
    <q-card v-else>
      <q-card-section>
        <div class="detail-layout">
          <q-responsive :ratio="2 / 3">
            <q-skeleton class="fit" square />
          </q-responsive>
          <div class="detail-skeletons">
            <q-skeleton />
            <q-skeleton width="50%" />
            <q-skeleton />
            <q-skeleton />
            <q-skeleton />
            <q-skeleton height="150px" />
            <div class="row skeleton-actions">
              <q-skeleton type="QBtn" />
              <q-skeleton type="QBtn" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { getErrMsg } from 'src/utils/getErrMsg'
import { parseTime } from 'src/utils/time'

import { Comment } from 'components'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useToNowRef } from 'src/composition/useToNowRef'

import { CommentType } from 'src/services/comment/types'
import { getComicInfo } from 'src/services/manga'

import type { Manga } from './types'

import MangaCover from './components/MangaCover.vue'
import { toManga } from './data'
import { useMangaLibrary } from './useMangaLibrary'

const props = defineProps<{ mangaId: string }>()
const ascending = ref(true)
const { progress, saveProgress } = useMangaLibrary()
const manga = ref<Manga>()
const loadError = ref('')

const savedChapter = computed(() =>
  manga.value?.chapters.find((chapter) => chapter.id === progress.value[manga.value!.id]?.chapterId),
)
const lastReadText = computed(() => {
  if (!manga.value) return '暂无'
  const page = progress.value[manga.value.id]?.page
  return savedChapter.value && page != null ? `${savedChapter.value.title} · 第 ${page} 页` : '暂无'
})
const updatedAtDesc = useToNowRef(() => manga.value?.updatedAt)
const sortedChapters = computed(() => {
  const chapters = manga.value?.chapters ?? []
  return ascending.value ? chapters : [...chapters].reverse()
})
const readerRoute = computed(() => {
  const firstChapter = manga.value?.chapters[0]
  if (!manga.value || !firstChapter) return undefined
  return {
    name: 'MangaReader',
    params: {
      mangaId: manga.value.id,
      chapterId: savedChapter.value?.id ?? firstChapter.id,
    },
  }
})

const request = useTimeoutFn(async (mangaId = props.mangaId) => {
  loadError.value = ''
  if (manga.value?.id !== mangaId) manga.value = undefined
  try {
    const id = Number(mangaId)
    if (!Number.isInteger(id)) throw new Error('无效的漫画 ID')
    const response = await getComicInfo(id)
    manga.value = toManga(response)
    const position = response.ReadPosition
    if (position) saveProgress(mangaId, String(position.ChapterId), Number(position.Position) || 1)
  } catch (error) {
    loadError.value = getErrMsg(error)
  }
})
const isActive = computed(() => manga.value?.id === props.mangaId)

watch(
  () => props.mangaId,
  (mangaId) => void request(mangaId),
)
useInitRequest(request, { isActive })

function dateFormat(time: string) {
  return parseTime(time).format('YYYY-MM-DD HH:mm')
}

function chapterDateFormat(time: string) {
  return parseTime(time).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.manga-detail {
  position: relative;
  width: 100%;
  max-width: 1440px;
  min-height: 320px;
}
.detail-state {
  display: grid;
  min-height: 280px;
  place-items: center;
}
.detail-skeletons {
  display: grid;
  align-content: start;
  gap: 12px;
}
.skeleton-actions {
  gap: 16px;
  margin-top: 12px;
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
  padding-top: 6px;
  line-height: 1;
  opacity: 0.6;
}
.info-lines {
  line-height: 1.65;
}
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding-top: 16px;
}
.chapter-header {
  margin-top: 12px;
  padding: 16px 0;
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
