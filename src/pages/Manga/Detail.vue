<template>
  <q-page padding>
    <template v-if="isActive">
      <q-card>
        <q-card-section>
          <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
            <q-grid-item>
              <q-card>
                <manga-cover :manga="manga" />
                <div class="absolute-bottom bottom-shadow q-pa-sm text-white">
                  <div class="row items-center">
                    <div class="row items-center gap-4">
                      <q-icon size="22px" name="mdiHeart" />
                      <span>{{ manga.followers }}</span>
                    </div>
                    <q-space />
                    <div class="row items-center gap-4">
                      <q-icon size="22px" name="mdiEye" />
                      <span>{{ manga.views }}</span>
                    </div>
                  </div>
                </div>
              </q-card>
            </q-grid-item>

            <q-grid-item span="2" xs="1" sm="1" md="1">
              <div class="text-subtitle1 text-weight-bold">《{{ manga.title }}》</div>

              <div class="q-mt-lg">
                <div>作者：{{ manga.author }}</div>
                <div>系列名：{{ manga.subtitle }}</div>
                <div>系列中文名：{{ manga.title }}</div>
                <div>最后更新：{{ manga.latestUpdate }}</div>
                <div>更新时间：{{ dateFormat(manga.updatedAt) }} ({{ updatedAtDesc }})</div>
                <div>上次阅读：{{ lastReadText }}</div>
              </div>

              <div class="row gap-4 q-mt-md">
                <q-chip v-for="tag in manga.tags" :key="tag" dense outline color="primary">{{ tag }}</q-chip>
              </div>

              <div class="q-mt-lg">
                <div>简介</div>
                <div class="introduction" v-html="sanitizerHtml(manga.description)"></div>
              </div>

              <div class="row items-center gap-16 q-mt-lg">
                <q-btn color="primary" :label="lastProgress ? '继续阅读' : '开始阅读'" :to="readerRoute" />
                <q-btn outline color="primary" label="追漫" disable />
              </div>
            </q-grid-item>
          </q-grid>

          <section v-for="book in manga.books" :key="book.id" class="chapter-group">
            <div class="row items-center chapter-header">
              <book-user-avatar :user="book.uploader" />
              <div>
                <div class="text-h6">{{ book.title }}</div>
                <div class="text-caption text-grey-7">共 {{ book.chapters.length }} 话</div>
              </div>
              <q-space />
              <q-btn flat dense no-caps :label="isAscending(book.id) ? '正序' : '倒序'" @click="toggleSort(book.id)" />
            </div>
            <q-separator />
            <q-grid :x-gap="8" :y-gap="8" cols="3" xs="1" sm="2" md="3" style="padding-top: 16px">
              <q-grid-item v-for="chapter in sortedChapters(book)" :key="chapter.id">
                <q-item
                  clickable
                  v-ripple
                  class="chapter-item rounded-borders"
                  :active="lastProgress?.book.id === book.id && lastProgress?.chapter.id === chapter.id"
                  active-class="bg-primary text-white"
                  :to="{ name: 'MangaReader', params: { mangaId: book.id, chapterId: chapter.id } }"
                >
                  <q-item-section avatar>
                    <q-avatar color="grey-3" text-color="grey-8" size="36px">{{ chapter.number }}</q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label lines="1">{{ chapter.title }}</q-item-label>
                    <q-item-label caption>
                      {{ chapterDateFormat(chapter.publishedAt) }} · {{ chapter.pages }}P
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-grid-item>
            </q-grid>
          </section>
        </q-card-section>
      </q-card>

      <comment :key="manga.title" class="q-mt-md" :type="CommentType.Series" :series-title="manga.title" />
    </template>
    <div v-else-if="loadError" class="row items-center justify-center text-negative" style="min-height: 280px">
      {{ loadError }}
    </div>
    <q-card v-else>
      <q-card-section>
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
          <q-grid-item>
            <q-card>
              <q-responsive :ratio="2 / 3">
                <q-skeleton class="fit" square />
              </q-responsive>
            </q-card>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1" class="column gap-16">
            <q-skeleton />
            <q-skeleton width="50%" />
            <q-skeleton />
            <q-skeleton />
            <q-skeleton />
            <q-skeleton height="150px" />
            <div class="row gap-16">
              <q-skeleton type="QBtn" />
              <q-skeleton type="QBtn" />
            </div>
          </q-grid-item>
        </q-grid>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getErrMsg } from 'src/utils/getErrMsg'
import sanitizerHtml from 'src/utils/sanitizeHtml'
import { parseTime } from 'src/utils/time'

import { BookUserAvatar, Comment } from 'components'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useToNowRef } from 'src/composition/useToNowRef'

import { CommentType } from 'src/services/comment/types'
import { getComicSeriesInfo } from 'src/services/manga'

import type { MangaBook, MangaSeries } from './types'
import type { ComicOrder } from 'src/services/manga'

import MangaCover from './components/MangaCover.vue'
import { toMangaSeries } from './data'
import { useMangaLibrary } from './useMangaLibrary'

const props = defineProps<{ seriesTitle: string }>()
const route = useRoute()
const order = computed<ComicOrder>(() => {
  const value = route.query.order
  return value === 'new' || value === 'view' ? value : 'latest'
})
const ascending = ref<Record<string, boolean>>({})
const { progress } = useMangaLibrary()
const manga = ref<MangaSeries>()
const loadError = ref('')

const bookProgress = (book: MangaBook) => {
  const local = progress.value[book.id]
  const remote = book.readPosition
  if (!remote) return local
  const remoteUpdatedAt = remote.readAt ? new Date(remote.readAt).getTime() : 0
  if (local && local.updatedAt >= remoteUpdatedAt) return local
  return { chapterId: remote.chapterId, page: remote.page, updatedAt: remoteUpdatedAt }
}
const lastProgress = computed(() => {
  const candidates =
    manga.value?.books.flatMap((book) => {
      const saved = bookProgress(book)
      const chapter = saved && book.chapters.find((item) => item.id === saved.chapterId)
      return saved && chapter ? [{ book, chapter, progress: saved }] : []
    }) ?? []
  return candidates.sort((a, b) => b.progress.updatedAt - a.progress.updatedAt)[0]
})
const lastReadText = computed(() => {
  const saved = lastProgress.value
  return saved ? `${saved.book.title} / ${saved.chapter.title} · 第 ${saved.progress.page} 页` : '暂无'
})
const updatedAtDesc = useToNowRef(() => manga.value?.updatedAt)
const isAscending = (bookId: string) => ascending.value[bookId] ?? true
const toggleSort = (bookId: string) => {
  ascending.value = { ...ascending.value, [bookId]: !isAscending(bookId) }
}
const sortedChapters = (book: MangaBook) => (isAscending(book.id) ? book.chapters : [...book.chapters].reverse())
const readerRoute = computed(() => {
  const saved = lastProgress.value
  const firstBook = manga.value?.books[0]
  const firstChapter = firstBook?.chapters[0]
  if (!saved && (!firstBook || !firstChapter)) return undefined
  return {
    name: 'MangaReader',
    params: {
      mangaId: saved?.book.id ?? firstBook!.id,
      chapterId: saved?.chapter.id ?? firstChapter!.id,
    },
  }
})

const request = useTimeoutFn(async (seriesTitle = props.seriesTitle) => {
  loadError.value = ''
  if (manga.value?.id !== seriesTitle) manga.value = undefined
  try {
    manga.value = toMangaSeries(await getComicSeriesInfo(seriesTitle, order.value))
    ascending.value = {}
  } catch (error) {
    loadError.value = getErrMsg(error)
  }
})
const isActive = computed(() => manga.value?.id === props.seriesTitle)

watch([() => props.seriesTitle, order], ([seriesTitle]) => void request(seriesTitle))
useInitRequest(request, { isActive })

function dateFormat(time: string) {
  return parseTime(time).format('YYYY-MM-DD HH:mm')
}

function chapterDateFormat(time: string) {
  return parseTime(time).format('YYYY-MM-DD')
}
</script>

<style lang="scss" scoped>
.bottom-shadow {
  background-color: unset;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 1), transparent);
}
.introduction {
  opacity: 0.6;
  line-height: 1;
  padding-top: 6px;
  :deep(p) {
    margin: 0;
  }
  :deep(img) {
    max-width: 100%;
  }
}
.chapter-header {
  padding: 16px 0;
  gap: 12px;
}
.chapter-group {
  margin-top: 12px;
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
</style>
