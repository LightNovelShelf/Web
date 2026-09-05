<template>
  <q-page padding>
    <q-card class="book-info-card">
      <q-card-section>
        <q-grid x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
          <q-grid-item>
            <q-card>
              <system-image v-if="isActive && book?.Cover" :url="book.Cover" :request-height="1024" :ratio="2 / 3">
                <div class="absolute-bottom bottom-shadow">
                  <div class="row">
                    <div class="row items-center cover-stat">
                      <q-icon size="22px" name="mdiHeart" />
                      <span>{{ book['Favorite'] }}</span>
                    </div>
                    <q-space />
                    <div class="row items-center cover-stat">
                      <q-icon size="22px" name="mdiEye" />
                      <span>{{ book['Views'] }}</span>
                    </div>
                  </div>
                </div>
              </system-image>
              <q-responsive v-else :ratio="2 / 3">
                <q-skeleton class="fit" square />
              </q-responsive>
            </q-card>
          </q-grid-item>
          <q-grid-item span="2" xs="1" sm="1" md="1">
            <div v-if="isActive">
              <div class="row items-center no-wrap book-info-header">
                <div class="text-subtitle1 text-weight-bold ellipsis">《{{ book['Title'] }}》</div>
                <q-space />
                <user-avatar :user="book.User" menu-anchor="bottom left" menu-self="top right" />
              </div>
              <div style="margin-top: 16px">作者：{{ displayAuthor }}</div>
              <div>
                系列名：
                <router-link
                  v-if="classification.series_name"
                  class="search-link"
                  :to="{
                    name: 'Search',
                    query: { keywords: classification.series_name, mode: 'name', tab: isComic ? 'Comic' : 'Book' },
                  }"
                >
                  {{ classification.series_name }}
                </router-link>
                <span v-else>暂无</span>
              </div>
              <div>
                系列中文名：
                <router-link
                  v-if="classification.series_name_cn"
                  class="search-link"
                  :to="{
                    name: 'Search',
                    query: {
                      keywords: classification.series_name_cn,
                      mode: 'name',
                      tab: isComic ? 'Comic' : 'Book',
                    },
                  }"
                >
                  {{ classification.series_name_cn }}
                </router-link>
                <span v-else>暂无</span>
              </div>
              <div>最后更新：{{ book['LastUpdatedChapter'] }}</div>
              <div>更新时间：{{ dateFormat(book['LastUpdatedAt']) }} (<time-ago :value="book['LastUpdatedAt']" />)</div>
              <div>上次阅读：{{ lastReadTitle }}</div>
              <div v-if="classification.tags?.length" class="row book-tags q-mt-md">
                <router-link
                  v-for="tag in classification.tags"
                  :key="tag"
                  class="tag-link"
                  :to="{ name: 'Search', query: { keywords: tag, mode: 'tags', tab: isComic ? 'Comic' : 'Book' } }"
                >
                  <q-chip clickable dense outline color="primary">{{ tag }}</q-chip>
                </router-link>
              </div>
              <div style="margin-top: 24px">
                <div>简介</div>
                <div class="introduction" v-html="sanitizerHtml(book['Introduction'])"></div>
              </div>
              <div style="margin-top: 24px"></div>

              <div class="row book-actions" v-if="isActive">
                <add-to-shelf v-if="!isComic" :book="bookInList" />
                <q-btn color="primary" :disable="chapters.length === 0" @click="startRead">
                  {{ position ? '继续阅读' : '开始阅读' }}
                </q-btn>
                <q-btn
                  v-if="!isComic && canDownloadBook"
                  color="secondary"
                  :loading="downloadingBookId === _bid"
                  @click="downloadBook(_bid, bookDownloadCost)"
                >
                  {{ bookDownloadCost ? `下载 · ${bookDownloadCost} 金币` : '下载' }}
                </q-btn>
                <q-btn v-if="book.CanEdit" color="red" :to="{ name: 'EditBook', params: { bid } }">快速编辑</q-btn>
              </div>
            </div>
            <div v-else class="book-skeletons">
              <q-skeleton />
              <q-skeleton width="50%" />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton />
              <q-skeleton height="150px" />
              <div></div>
              <div>
                <div class="row skeleton-actions">
                  <q-skeleton type="QBtn" />
                  <q-skeleton type="QBtn" />
                </div>
              </div>
            </div>
          </q-grid-item>
        </q-grid>

        <div v-if="isActive" class="row items-center chapter-header">
          <div>
            <div class="text-h6">章节列表</div>
            <div class="text-caption text-grey-7">共 {{ chapters.length }} {{ isComic ? '话' : '章' }}</div>
          </div>
          <q-space />
          <q-btn flat dense no-caps :label="ascending ? '正序' : '倒序'" @click="ascending = !ascending" />
        </div>
        <q-separator v-if="isActive" />
        <q-grid v-if="isActive && isComic" :x-gap="8" :y-gap="8" cols="3" xs="1" sm="2" md="3" class="comic-chapters">
          <q-grid-item v-for="item in sortedChapters" :key="item.Id">
            <q-item
              clickable
              v-ripple
              class="chapter-item rounded-borders"
              :active="position?.cid === item.Id"
              active-class="bg-primary text-white"
              :to="chapterRoute(item)"
            >
              <q-item-section avatar>
                <q-avatar color="grey-3" text-color="grey-8" size="36px">{{ item.SortNum }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1">{{ item.Title }}</q-item-label>
                <q-item-label caption>{{ item.PageCount }}P</q-item-label>
              </q-item-section>
              <q-item-section v-if="book.CanDownload" side>
                <q-btn
                  flat
                  dense
                  round
                  icon="mdiDownload"
                  :loading="downloadingChapterId === item.Id"
                  @click.stop.prevent="downloadChapter(item.Id, item.DownloadCost)"
                />
              </q-item-section>
            </q-item>
          </q-grid-item>
        </q-grid>
        <q-list v-else-if="isActive" separator>
          <q-item v-for="item in sortedChapters" :key="item.Id" :to="chapterRoute(item)" clickable v-ripple>
            <q-item-section>{{ item.Title }}</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <comment
      :key="_bid"
      v-intersection="commentBeShown"
      class="comment"
      style="margin-top: 12px"
      :type="CommentType.Book"
      :id="_bid"
    />
    <q-page-sticky position="bottom-right" :offset="fabPos" style="z-index: 1">
      <div class="column gap-8">
        <q-btn v-if="isActive" round size="md" color="primary" icon="mdiBookMultiple" @click="seriesShow = true">
          <q-tooltip>系列</q-tooltip>
        </q-btn>
        <q-btn round size="md" color="accent" :icon="scrollIcon" @click="scrollClick" />
      </div>
    </q-page-sticky>

    <q-dialog v-model="seriesShow">
      <q-card class="series-dialog">
        <q-card-section>
          <div class="text-h6">系列</div>
          <div class="text-caption text-grey-7">{{ seriesTitle }}</div>
        </q-card-section>
        <q-separator />
        <q-list separator>
          <q-item
            v-for="item in seriesBooks"
            :key="item.Id"
            clickable
            v-close-popup
            :active="item.Id === _bid"
            @click="openSeriesBook(item.Id)"
          >
            <q-item-section avatar>
              <system-image
                v-if="item.Cover"
                class="series-cover rounded-borders"
                :url="item.Cover"
                :request-height="SERIES_COVER_REQUEST_HEIGHT"
                :ratio="2 / 3"
              />
              <q-avatar v-else rounded color="grey-3" text-color="grey-7" icon="mdiBookOpenPageVariantOutline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.Title }}</q-item-label>
              <q-item-label v-if="item.Id === _bid" caption>当前书籍</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar, scroll } from 'quasar'
import { computed, onActivated, ref, toRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { userReadPositionDB } from '@/utils/storage/db'
import { parseTime } from '@/utils/time'

import { useSessionStore } from '@/stores/session'

import { Comment, UserAvatar } from '@/components'
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { QGrid, QGridItem } from '@/components/grid'
import SystemImage from '@/components/SystemImage.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { useBookDownload } from '@/composition/biz/useBookDownload'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { loadHistory } from '@/pages/Book/Read/history'
import { useMangaProgress } from '@/pages/Manga/useMangaProgress'
import { getBookInfo } from '@/services/book'
import { CommentType } from '@/services/comment/types'

import type { BookServicesTypes } from '@/services/book'
import type { BookInList, BookSeriesItem, ChapterInfo } from '@/services/book/types'
import type { RouteLocationRaw } from 'vue-router'

const SERIES_COVER_REQUEST_HEIGHT = 256

type DetailChapter = ChapterInfo
type ReadPosition = { cid: number; xPath: string }

const props = defineProps<{ bid: string }>()

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const appStore = useSessionStore()
const { progress: mangaProgress } = useMangaProgress()
const fabPos = ref([18, 18])
const bookInfo = ref<BookServicesTypes.GetBookInfoRes>()
const position = ref<ReadPosition | null>(null)
const ascending = ref(true)
const seriesShow = ref(false)
const _bid = computed(() => Number(props.bid))
const book = computed(() => bookInfo.value?.Book)
const isComic = computed(() => book.value?.Type === 'Comic')
const seriesTitle = computed(() => bookInfo.value?.SeriesTitle ?? '')
const seriesBooks = computed<BookSeriesItem[]>(() => bookInfo.value?.Series ?? [])
const chapters = computed<DetailChapter[]>(() => book.value?.Chapters ?? [])
const sortedChapters = computed(() => {
  const result = [...chapters.value]
  return ascending.value ? result : result.reverse()
})
const canDownloadBook = computed(() => !isComic.value && Boolean(book.value?.CanDownload))
const bookDownloadCost = computed(() => (isComic.value ? 0 : (book.value?.DownloadCost ?? 0)))
const classification = computed(() => book.value?.Extra?.classification ?? {})
const displayAuthor = computed(() => book.value?.Author || classification.value.author || '暂无')
const isActive = computed(() => book.value?.Id === _bid.value)

function cachedPosition(): ReadPosition | null {
  if (isComic.value) {
    const saved = mangaProgress.value[String(_bid.value)]
    return saved ? { cid: Number(saved.chapterId), xPath: String(saved.page) } : null
  }
  return loadHistory(appStore.userId, _bid.value) ?? null
}

const getInfo = useTimeoutFn(async () => {
  try {
    const response = await getBookInfo(_bid.value)
    bookInfo.value = response
    const detailRoute = response.Book.Type === 'Comic' ? 'MangaInfo' : 'BookInfo'
    if (route.name !== detailRoute) {
      await router.replace({ name: detailRoute, params: { bid: _bid.value } })
    }
    const serverPosition = response.ReadPosition
    position.value =
      cachedPosition() ??
      (serverPosition
        ? {
            cid: serverPosition.ChapterId,
            xPath: serverPosition.Position,
          }
        : null)
    if (!isComic.value && position.value) {
      userReadPositionDB.set(`${appStore.userId}_${_bid.value}`, toRaw(position.value))
    }
  } catch (error) {
    $q.notify({
      message: getErrMsg(error),
      color: 'negative',
      timeout: 1500,
    })
  }
})

function chapterRoute(chapter: DetailChapter): RouteLocationRaw {
  return isComic.value
    ? { name: 'MangaReader', params: { mangaId: _bid.value, chapterId: chapter.Id } }
    : { name: 'Read', params: { bid: _bid.value, sortNum: chapter.SortNum } }
}

async function startRead() {
  const chapter = chapters.value.find((item) => item.Id === position.value?.cid) ?? chapters.value[0]
  if (chapter) await router.push(chapterRoute(chapter))
}

async function openSeriesBook(id: number) {
  if (id === _bid.value) return
  await router.push({ name: isComic.value ? 'MangaInfo' : 'BookInfo', params: { bid: id } })
}

const { downloadingId: downloadingBookId, download: downloadBook } = useBookDownload()
const { downloadingId: downloadingChapterId, download: downloadChapter } = useBookDownload('chapter')
const bookInList = computed<BookInList | null>(() =>
  book.value
    ? ({
        ...toRaw(book.value),
        SeriesTitle: seriesTitle.value,
        UserName: book.value.User.UserName,
      } as BookInList)
    : null,
)
const lastReadTitle = computed(() => {
  if (position.value?.cid) return chapters.value.find((chapter) => chapter.Id === position.value?.cid)?.Title ?? '暂无'
  return '暂无'
})

function dateFormat(time: Date | string) {
  return parseTime(time).format('YYYY-MM-DD HH:mm')
}

watch(_bid, () => {
  ascending.value = true
  seriesShow.value = false
  position.value = null
  void getInfo()
})
useInitRequest(getInfo, { isActive })
onActivated(() => {
  position.value = cachedPosition() ?? position.value
})

const commentShow = ref(false)
function upScrollClick() {
  const el = document.getElementsByClassName('book-info-card')[0] as HTMLElement
  const target = scroll.getScrollTarget(el)
  scroll.setVerticalScrollPosition(target, el.offsetTop, 100)
}
function downScrollClick() {
  const el = document.getElementsByClassName('comment')[0] as HTMLElement
  const target = scroll.getScrollTarget(el)
  scroll.setVerticalScrollPosition(target, el.offsetTop, 100)
}
const scrollClick = computed(() => (commentShow.value ? upScrollClick : downScrollClick))
const scrollIcon = computed(() => (commentShow.value ? 'mdiArrowUp' : 'mdiArrowDown'))
function commentBeShown(entries: IntersectionObserverEntry) {
  commentShow.value = entries.isIntersecting
  return true
}
</script>

<style scoped lang="scss">
.book-info-header {
  gap: 12px;
}

.cover-stat,
.book-tags {
  gap: 4px;
}

.book-actions,
.skeleton-actions {
  gap: 16px;
}

.chapter-header {
  margin-top: 12px;
  padding: 16px 0;
}

.comic-chapters {
  padding-top: 16px;
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

.series-dialog {
  width: min(520px, 90vw);
  max-height: 80vh;
}

.series-cover {
  width: 48px;
}
.book-skeletons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-link {
  color: var(--q-primary);
  text-decoration: none;
}

.search-link:hover {
  text-decoration: underline;
}

.tag-link {
  color: inherit;
  text-decoration: none;
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

.bottom-shadow {
  background-color: unset;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 1), transparent);
}

a {
  color: unset;
  text-decoration: unset;
}
</style>
