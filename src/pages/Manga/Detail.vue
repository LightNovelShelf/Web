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
                <p class="introduction">{{ manga.description }}</p>
              </div>

              <div class="row items-center gap-16 q-mt-lg">
                <q-btn color="primary" :label="progress[manga.id] ? '继续阅读' : '开始阅读'" :to="readerRoute" />
                <q-btn outline color="primary" label="追漫" disable />
              </div>
            </q-grid-item>
          </q-grid>
          <div class="row items-center chapter-header">
            <div>
              <div class="text-h6">章节列表</div>
              <div class="text-caption text-grey-7">共 {{ manga.chapters.length }} 话</div>
            </div>
            <q-space />
            <q-btn flat dense no-caps :label="ascending ? '正序' : '倒序'" @click="ascending = !ascending" />
          </div>
          <q-separator />
          <q-grid :x-gap="8" :y-gap="8" cols="3" xs="1" sm="2" md="3" style="padding-top: 16px">
            <q-grid-item v-for="chapter in sortedChapters" :key="chapter.id">
              <q-item
                clickable
                v-ripple
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
                  <q-item-label caption>
                    {{ chapterDateFormat(chapter.publishedAt) }} · {{ chapter.pages }}P
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-grid-item>
          </q-grid>
        </q-card-section>
      </q-card>

      <comment class="q-mt-md" :type="CommentType.Book" :id="Number(manga.id)" />
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

import { getErrMsg } from 'src/utils/getErrMsg'
import { parseTime } from 'src/utils/time'

import { Comment } from 'components'
import { QGrid, QGridItem } from 'components/grid'

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
.bottom-shadow {
  background-color: unset;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 1), transparent);
}
.introduction {
  margin: 0;
  padding-top: 6px;
  line-height: 1;
  opacity: 0.6;
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
</style>
