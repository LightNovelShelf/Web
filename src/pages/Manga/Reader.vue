<template>
  <q-page
    class="manga-reader"
    :class="[`mode-${settings.mode}`, { 'toolbar-hidden': !toolbarVisible }]"
    :style="themeStyle"
  >
    <template v-if="manga && currentChapter">
    <header class="reader-topbar" @click.stop>
      <div class="topbar-leading">
        <q-btn
          flat
          round
          icon="mdiArrowLeft"
          aria-label="返回作品详情"
          :to="{ name: 'MangaDetail', params: { seriesTitle: manga.seriesTitle } }"
        />
        <div class="work-info">
          <strong>{{ manga.title }}</strong>
          <span>{{ currentChapter.title }}</span>
        </div>
      </div>
      <div class="topbar-actions">
        <q-btn
          flat
          round
          disable
          icon="mdiHeartOutline"
          aria-label="追漫功能暂不可用"
        />
      </div>
    </header>

    <main ref="readerCanvas" class="reader-canvas" @click.self="toggleToolbar" @wheel="handleWheel">
      <button
        v-if="settings.mode === 'horizontal'"
        class="page-zone page-zone-left"
        type="button"
        :aria-label="settings.direction === 'rtl' ? '下一页' : '上一页'"
        @click.stop="settings.direction === 'rtl' ? nextPage() : previousPage()"
      ></button>

      <div v-if="settings.mode === 'horizontal'" class="horizontal-stage" @click.self="toggleToolbar">
        <div class="page-spread" :class="{ double: effectivePageMode === 'double', rtl: settings.direction === 'rtl' }">
          <manga-page
            v-for="page in visiblePages"
            :key="`${currentChapter.id}-${page.number}`"
            :page-number="page.number"
            :image="page.image"
            loading="eager"
          />
        </div>
      </div>

      <div v-else class="vertical-stage">
        <div class="chapter-opening">
          <span>VOLUME {{ String(currentChapter.number).padStart(2, '0') }}</span>
          <h1>{{ currentChapter.title }}</h1>
          <p>{{ manga.title }}</p>
        </div>
        <manga-page
          v-for="page in pages"
          :key="`${currentChapter.id}-${page.number}`"
          :data-page="page.number"
          :page-number="page.number"
          :image="page.image"
        />
        <div class="chapter-ending">
          <div>本卷完</div>
          <strong>下一卷 · {{ nextChapter?.title ?? '敬请期待' }}</strong>
          <q-btn
            v-if="nextChapter"
            unelevated
            color="amber-7"
            text-color="grey-10"
            label="阅读下一卷"
            icon-right="mdiArrowRight"
            @click="goToChapter(nextChapter.id)"
          />
        </div>
      </div>

      <button
        v-if="settings.mode === 'horizontal'"
        class="page-zone page-zone-right"
        type="button"
        :aria-label="settings.direction === 'rtl' ? '上一页' : '下一页'"
        @click.stop="settings.direction === 'rtl' ? previousPage() : nextPage()"
      ></button>

      <button
        v-if="settings.mode === 'horizontal'"
        class="toolbar-zone"
        type="button"
        aria-label="显示或隐藏状态栏"
        @click.stop="toggleToolbar"
      />
    </main>

    <div class="reader-rail" @click.stop>
      <q-btn
        flat
        round
        icon="mdiTune"
        aria-label="阅读设置"
        :class="{ active: panel === 'settings' }"
        @click="togglePanel('settings')"
      >
        <q-tooltip anchor="center left" self="center right">阅读设置</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        icon="mdiFormatListBulleted"
        aria-label="分卷目录"
        :class="{ active: panel === 'catalog' }"
        @click="togglePanel('catalog')"
      >
        <q-tooltip anchor="center left" self="center right">分卷目录</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        :icon="$q.fullscreen.isActive ? 'mdiFullscreenExit' : 'mdiFullscreen'"
        aria-label="切换全屏"
        @click="$q.fullscreen.toggle()"
      >
        <q-tooltip anchor="center left" self="center right">全屏</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        :icon="toolbarVisible ? 'mdiEyeOff' : 'mdiEye'"
        aria-label="显示或隐藏工具栏"
        @click="toggleToolbar"
      >
        <q-tooltip anchor="center left" self="center right">沉浸模式</q-tooltip>
      </q-btn>
    </div>

    <aside v-if="panel" class="reader-panel" @click.stop>
      <div class="panel-header">
        <div>
          <span>{{ panel === 'settings' ? 'READING PREFERENCES' : 'EPISODE GUIDE' }}</span>
          <strong>{{ panel === 'settings' ? '阅读设置' : '分卷目录' }}</strong>
        </div>
        <q-btn flat round dense icon="mdiClose" aria-label="关闭面板" @click="panel = null" />
      </div>

      <template v-if="panel === 'settings'">
        <div class="setting-group">
          <label>阅读模式</label>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: settings.mode === 'horizontal' }"
              @click="settings.mode = 'horizontal'"
            >
              左右翻页
            </button>
            <button type="button" :class="{ active: settings.mode === 'vertical' }" @click="settings.mode = 'vertical'">
              上下滚动
            </button>
          </div>
        </div>
        <div class="setting-group" :class="{ disabled: settings.mode === 'vertical' || $q.screen.lt.sm }">
          <label>页面模式 <span v-if="$q.screen.lt.sm">· 手机端固定单页</span></label>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: settings.pageMode === 'single' }"
              @click="settings.pageMode = 'single'"
            >
              单页
            </button>
            <button
              type="button"
              :class="{ active: settings.pageMode === 'double' }"
              @click="settings.pageMode = 'double'"
            >
              双页
            </button>
          </div>
        </div>
        <div class="setting-group" :class="{ disabled: settings.mode === 'vertical' }">
          <label>翻页方向</label>
          <div class="segmented">
            <button type="button" :class="{ active: settings.direction === 'ltr' }" @click="settings.direction = 'ltr'">
              从左向右
            </button>
            <button type="button" :class="{ active: settings.direction === 'rtl' }" @click="settings.direction = 'rtl'">
              日漫模式
            </button>
          </div>
        </div>
        <div class="setting-tip"><q-icon name="mdiInformation" /> 设置会自动保存在当前浏览器。</div>
      </template>

      <div v-else class="catalog-list">
        <button
          v-for="chapter in manga.chapters"
          :key="chapter.id"
          type="button"
          :class="{ active: chapter.id === currentChapter.id }"
          @click="goToChapter(chapter.id)"
        >
          <span>{{ String(chapter.number).padStart(2, '0') }}</span>
          <div>
            <strong>{{ chapter.title }}</strong
            ><small>{{ chapter.pages }}P · {{ toNow(parseTime(chapter.publishedAt)) }}</small>
          </div>
          <q-icon v-if="chapter.id === currentChapter.id" name="mdiBookmark" />
        </button>
      </div>
    </aside>

    <footer class="reader-bottombar" @click.stop>
      <q-btn
        class="bottombar-nav bottombar-nav-previous"
        flat
        round
        icon="mdiSkipPrevious"
        :disable="!previousChapter"
        aria-label="上一卷"
        @click="previousChapter && goToChapter(previousChapter.id)"
      />
      <div class="progress-control">
        <div class="page-count">
          {{ sliderPage }} <span>/ {{ currentChapter.pages }}</span>
        </div>
        <div class="slider-wrap">
          <q-slider
            v-model="sliderPage"
            :min="1"
            :max="currentChapter.pages"
            :step="effectivePageMode === 'double' && settings.mode === 'horizontal' ? 2 : 1"
            color="amber-7"
            track-color="grey-7"
            @change="commitSliderPage"
          />
        </div>
      </div>
      <q-btn
        class="bottombar-nav bottombar-nav-next"
        flat
        round
        icon="mdiSkipNext"
        :disable="!nextChapter"
        aria-label="下一卷"
        @click="nextChapter && goToChapter(nextChapter.id)"
      />
    </footer>
    </template>
    <div v-else class="reader-loading">
      <q-spinner-dots v-if="loading" color="amber-7" size="48px" />
      <span v-else>{{ loadError || '漫画分卷不存在' }}</span>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useSwipe } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { getErrMsg } from 'src/utils/getErrMsg'
import { parseTime, toNow } from 'src/utils/time'

import { saveReadPosition } from 'src/services/book'
import { getComicContent, getComicInfo } from 'src/services/manga'

import type { Manga } from './types'

import MangaPage from './components/MangaPage.vue'
import { toManga, toMangaImage } from './data'
import { useMangaLibrary } from './useMangaLibrary'

const props = defineProps<{ mangaId: string; chapterId: string }>()
const $q = useQuasar()
const router = useRouter()
const { progress, saveProgress } = useMangaLibrary()
const readerCanvas = ref<HTMLElement>()
const toolbarVisible = ref(true)
const panel = ref<'settings' | 'catalog' | null>(null)
const manga = ref<Manga>()
const loading = ref(false)
const loadError = ref('')
const activeChapterId = ref('')
let requestVersion = 0
let saveTimer: ReturnType<typeof setTimeout> | undefined
const savedSettings = (() => {
  try {
    return JSON.parse(window.localStorage.getItem('light-novel-shelf:manga-reader-settings') ?? '')
  } catch {
    return {}
  }
})()
const settings = reactive({
  mode: savedSettings.mode === 'vertical' ? 'vertical' : 'horizontal',
  pageMode: savedSettings.pageMode === 'double' ? 'double' : 'single',
  direction: savedSettings.direction === 'rtl' ? 'rtl' : 'ltr',
} as { mode: 'horizontal' | 'vertical'; pageMode: 'single' | 'double'; direction: 'ltr' | 'rtl' })

const swipeTarget = computed(() => (settings.mode === 'horizontal' ? readerCanvas.value : undefined))
useSwipe(swipeTarget, {
  passive: false,
  threshold: 50,
  onSwipeEnd: (_event, direction) => {
    if (direction === 'left') {
      if (settings.direction === 'rtl') previousPage()
      else nextPage()
    } else if (direction === 'right') {
      if (settings.direction === 'rtl') nextPage()
      else previousPage()
    }
  },
})

const currentChapter = computed(() =>
  manga.value?.chapters.find((chapter) => chapter.id === activeChapterId.value),
)
const currentPage = ref(1)
const sliderPage = ref(1)
const preloadedImageUrls = new Set<string>()
const chapterIndex = computed(() =>
  manga.value && currentChapter.value
    ? manga.value.chapters.findIndex((chapter) => chapter.id === currentChapter.value!.id)
    : -1,
)
const previousChapter = computed(() => manga.value?.chapters[chapterIndex.value - 1])
const nextChapter = computed(() => manga.value?.chapters[chapterIndex.value + 1])
const effectivePageMode = computed(() => ($q.screen.lt.sm ? 'single' : settings.pageMode))
const pages = computed(() =>
  (currentChapter.value?.images ?? []).map((image, index) => ({ number: index + 1, image })),
)
const visiblePages = computed(() => {
  const chapter = currentChapter.value
  if (!chapter) return []
  const pageNumbers =
    effectivePageMode.value === 'single' ? [currentPage.value] : [currentPage.value, currentPage.value + 1]
  return pageNumbers
    .filter((page) => page <= chapter.pages)
    .map((page) => ({ number: page, image: chapter.images[page - 1] }))
})
const themeStyle = computed(() => ({
  '--reader-primary': manga.value?.theme.primary,
  '--reader-secondary': manga.value?.theme.secondary,
  '--reader-accent': manga.value?.theme.accent,
}))

watch(
  settings,
  () => {
    window.localStorage.setItem('light-novel-shelf:manga-reader-settings', JSON.stringify(settings))
    if (effectivePageMode.value === 'double' && currentPage.value % 2 === 0) currentPage.value -= 1
    if (settings.mode === 'vertical') void scrollToCurrentPage()
  },
  { deep: true },
)

watch(
  [() => props.mangaId, () => props.chapterId],
  async ([mangaId, chapterId]) => {
    const version = ++requestVersion
    loading.value = true
    loadError.value = ''
    if (manga.value && manga.value.id !== mangaId) {
      manga.value = undefined
      activeChapterId.value = ''
    }
    try {
      const bookId = Number(mangaId)
      const cid = Number(chapterId)
      if (!Number.isInteger(bookId) || !Number.isInteger(cid)) throw new Error('无效的漫画或分卷 ID')
      const [info, content] = await Promise.all([getComicInfo(bookId), getComicContent(cid)])
      if (version !== requestVersion) return
      if (content.Chapter.BookId !== bookId) throw new Error('漫画与分卷不匹配')

      const loadedManga = toManga(info)
      const loadedChapter = loadedManga.chapters.find((chapter) => chapter.id === chapterId)
      if (!loadedChapter) throw new Error('分卷不存在')
      loadedChapter.images = content.Chapter.Images.map((image) =>
        toMangaImage(image.Url, image.Width, image.Height, image.Placeholder),
      )
      loadedChapter.pages = loadedChapter.images.length
      manga.value = loadedManga
      activeChapterId.value = chapterId

      const serverPosition = content.ReadPosition
      if (serverPosition)
        saveProgress(mangaId, String(serverPosition.ChapterId), Number(serverPosition.Position) || 1)
      const saved = progress.value[mangaId]
      currentPage.value = saved?.chapterId === chapterId ? Math.min(saved.page, loadedChapter.pages) : 1
      panel.value = null
      window.scrollTo({ top: 0 })
    } catch (error) {
      if (version !== requestVersion) return
      if (!manga.value || manga.value.id !== mangaId) {
        manga.value = undefined
        activeChapterId.value = ''
      }
      loadError.value = getErrMsg(error)
    } finally {
      if (version === requestVersion) loading.value = false
    }
  },
  { immediate: true },
)

watch(currentPage, (page) => {
  sliderPage.value = page
  saveCurrentProgress()
})

watch([currentPage, () => currentChapter.value?.id, effectivePageMode, () => settings.mode], preloadNearbyPages, {
  immediate: true,
})

function preloadNearbyPages() {
  const chapter = currentChapter.value
  if (!chapter) return
  const visiblePageCount = settings.mode === 'horizontal' && effectivePageMode.value === 'double' ? 2 : 1
  const firstVisiblePage = currentPage.value
  const lastVisiblePage = Math.min(chapter.pages, currentPage.value + visiblePageCount - 1)
  const pageNumbers = [firstVisiblePage - 2, firstVisiblePage - 1, lastVisiblePage + 1, lastVisiblePage + 2]

  pageNumbers.forEach((pageNumber) => {
    const image = chapter.images[pageNumber - 1]
    if (!image || preloadedImageUrls.has(image.url)) return

    preloadedImageUrls.add(image.url)
    const preloader = new Image()
    preloader.decoding = 'async'
    preloader.onerror = () => preloadedImageUrls.delete(image.url)
    preloader.src = image.url
  })
}

async function scrollToCurrentPage() {
  await nextTick()
  const target = document.querySelector(`[data-page="${currentPage.value}"]`)
  target?.scrollIntoView({ block: 'start' })
}

function saveCurrentProgress() {
  if (!manga.value || !currentChapter.value) return
  saveProgress(manga.value.id, currentChapter.value.id, currentPage.value)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (!manga.value || !currentChapter.value) return
    void saveReadPosition({
      Bid: Number(manga.value.id),
      Cid: Number(currentChapter.value.id),
      XPath: String(currentPage.value),
    }).catch(() => undefined)
  }, 400)
}

function commitSliderPage(page: number | null) {
  if (page === null || page === currentPage.value) return
  currentPage.value = page
}

function previousPage() {
  const step = effectivePageMode.value === 'double' ? 2 : 1
  if (currentPage.value > 1) currentPage.value = Math.max(1, currentPage.value - step)
  else if (previousChapter.value) goToChapter(previousChapter.value.id, 'last')
}

function nextPage() {
  if (!currentChapter.value) return
  const step = effectivePageMode.value === 'double' ? 2 : 1
  if (currentPage.value + step <= currentChapter.value.pages) currentPage.value += step
  else if (nextChapter.value) goToChapter(nextChapter.value.id)
  else showNotice('已经是最后一卷了')
}

function goToChapter(chapterId: string, page: 'first' | 'last' = 'first') {
  if (!manga.value) return
  const chapter = manga.value.chapters.find((item) => item.id === chapterId)
  if (!chapter) return
  const targetPage = page === 'last' ? chapter.pages : 1
  saveProgress(manga.value.id, chapterId, targetPage)
  void router.push({ name: 'MangaReader', params: { mangaId: manga.value.id, chapterId } })
}

function togglePanel(target: 'settings' | 'catalog') {
  panel.value = panel.value === target ? null : target
  toolbarVisible.value = true
}

function toggleToolbar() {
  toolbarVisible.value = !toolbarVisible.value
  if (!toolbarVisible.value) panel.value = null
}

function showNotice(message: string) {
  $q.notify({ position: 'top', timeout: 1200, message })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    if (settings.direction === 'rtl') previousPage()
    else nextPage()
  }
  if (event.key === 'ArrowLeft') {
    if (settings.direction === 'rtl') nextPage()
    else previousPage()
  }
  if (event.key.toLowerCase() === 'c') togglePanel('catalog')
  if (event.key.toLowerCase() === 's') togglePanel('settings')
  if (event.key === 'Escape') panel.value = null
}

function handleWheel(event: WheelEvent) {
  if (settings.mode !== 'horizontal' || event.ctrlKey) return
  event.preventDefault()
  if (event.deltaY > 0) nextPage()
  else if (event.deltaY < 0) previousPage()
}

function handleVerticalScroll() {
  if (settings.mode !== 'vertical') return
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('[data-page]'))
  const target = candidates.reduce<HTMLElement | undefined>((closest, item) => {
    if (!closest) return item
    return Math.abs(item.getBoundingClientRect().top - 110) < Math.abs(closest.getBoundingClientRect().top - 110)
      ? item
      : closest
  }, undefined)
  const page = Number(target?.dataset.page)
  if (page && page !== currentPage.value) currentPage.value = page
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleVerticalScroll, { passive: true })
  saveCurrentProgress()
})

onBeforeUnmount(() => {
  clearTimeout(saveTimer)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleVerticalScroll)
})
</script>

<style lang="scss" scoped>
.manga-reader {
  --reader-primary: #171d35;
  --reader-secondary: #58457e;
  --reader-accent: #f0c978;
  min-height: 100vh !important;
  color: #eee;
  background: #17181b;
}
.reader-loading {
  display: grid;
  min-height: 100vh;
  place-items: center;
}
.reader-topbar,
.reader-bottombar,
.reader-rail {
  position: fixed;
  z-index: 50;
  color: #f5f5f5;
  background: rgba(22, 23, 27, 0.9);
  backdrop-filter: blur(16px);
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.reader-topbar {
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 6px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.topbar-leading,
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.work-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.work-info strong {
  overflow: hidden;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.work-info span {
  margin-top: 2px;
  color: #9e9ea5;
  font-size: 10px;
}
.reader-canvas {
  position: relative;
  min-height: 100vh;
  background: radial-gradient(circle at 50% 40%, #32333a 0, #1d1e22 45%, #111215 100%);
}
.reader-canvas::before {
  position: fixed;
  inset: 0;
  pointer-events: none;
  content: '';
  opacity: 0.08;
  background-image: radial-gradient(#fff 0.6px, transparent 0.6px);
  background-size: 6px 6px;
}
.horizontal-stage {
  --reader-page-height: calc(100svh - 110px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 58px 0 52px;
}
.page-spread {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: var(--reader-page-height);
  max-height: none;
}
.page-spread.double {
  width: 100%;
}
.page-spread.rtl {
  flex-direction: row-reverse;
}
.page-spread :deep(.comic-page) {
  width: auto;
  max-width: none;
  height: min(var(--reader-page-height), 138.889vw);
  max-height: none;
  flex: none;
}
.page-spread.double :deep(.comic-page) {
  max-width: none;
  height: min(var(--reader-page-height), 69.444vw);
}
.page-zone {
  position: fixed;
  z-index: 20;
  top: 58px;
  bottom: 52px;
  width: 32%;
  min-width: 0;
  background: transparent;
  border: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.page-zone-left {
  left: 0;
}
.page-zone-right {
  right: 0;
}
.toolbar-zone {
  position: fixed;
  z-index: 19;
  top: 58px;
  right: 32%;
  bottom: 52px;
  left: 32%;
  padding: 0;
  background: transparent;
  border: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.vertical-stage {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 22px;
  padding: 100px 20px 80px;
}
.vertical-stage :deep(.comic-page) {
  scroll-margin-top: 80px;
}
.chapter-opening,
.chapter-ending {
  display: grid;
  place-items: center;
  width: min(790px, 100%);
  min-height: 330px;
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, var(--reader-primary), var(--reader-secondary));
}
.chapter-opening span {
  color: var(--reader-accent);
  font:
    700 11px Georgia,
    serif;
  letter-spacing: 0.22em;
}
.chapter-opening h1 {
  margin: 18px 0 7px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(28px, 5vw, 54px);
}
.chapter-opening p {
  opacity: 0.55;
}
.chapter-ending {
  gap: 15px;
  min-height: 280px;
  background: #24252a;
}
.chapter-ending > div {
  color: var(--reader-accent);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 28px;
}
.chapter-ending strong {
  color: #aaaab0;
  font-size: 13px;
}

.reader-rail {
  top: 50%;
  right: 18px;
  display: flex;
  flex-direction: column;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transform: translateY(-50%);
}
.reader-rail :deep(.q-btn) {
  color: #aaaab1;
}
.reader-rail :deep(.q-btn.active),
.reader-rail :deep(.q-btn:hover) {
  color: var(--reader-accent);
}
.reader-panel {
  position: fixed;
  z-index: 48;
  top: 58px;
  right: 0;
  bottom: 52px;
  width: min(390px, calc(100vw - 28px));
  padding: 24px;
  overflow: auto;
  color: #eee;
  background: rgba(27, 28, 33, 0.97);
  border-left: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: -20px 0 45px rgba(0, 0, 0, 0.28);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 19px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.panel-header div {
  display: flex;
  flex-direction: column;
}
.panel-header span {
  color: var(--reader-accent);
  font:
    700 9px Georgia,
    serif;
  letter-spacing: 0.18em;
}
.panel-header strong {
  margin-top: 5px;
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: 22px;
}
.setting-group {
  margin-top: 25px;
}
.setting-group label {
  display: block;
  margin-bottom: 10px;
  color: #aaaab0;
  font-size: 11px;
}
.setting-group.disabled {
  opacity: 0.35;
  pointer-events: none;
}
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3px;
  background: #202126;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.segmented button {
  min-height: 40px;
  color: #a9a9ae;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.segmented button.active {
  color: #1b1b1e;
  background: var(--reader-accent);
  font-weight: 700;
}
.setting-tip {
  display: flex;
  gap: 8px;
  margin-top: 28px;
  padding: 14px;
  color: #96969d;
  background: #202126;
  font-size: 10px;
}
.catalog-list {
  margin-top: 14px;
}
.catalog-list button {
  display: grid;
  grid-template-columns: 37px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  width: 100%;
  min-height: 66px;
  padding: 10px 8px;
  color: #bdbdc2;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}
.catalog-list button > span {
  color: #777780;
  font:
    italic 17px Georgia,
    serif;
}
.catalog-list button div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.catalog-list button strong {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-list button small {
  margin-top: 5px;
  color: #777780;
  font-size: 9px;
}
.catalog-list button.active {
  color: var(--reader-accent);
  background: rgba(255, 255, 255, 0.04);
}
.catalog-list button.active > span {
  color: var(--reader-accent);
}

.reader-bottombar {
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 2px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.bottombar-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.bottombar-nav-previous {
  left: 20px;
}
.bottombar-nav-next {
  right: 20px;
}
.progress-control {
  display: flex;
  align-items: center;
  gap: 24px;
  width: min(700px, calc(100% - 160px));
}
.slider-wrap {
  display: flex;
  align-items: center;
  width: 100%;
}
.slider-wrap :deep(.q-slider) {
  flex: 1;
}
.page-count {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: none;
  min-width: 54px;
  height: 28px;
  color: #fff;
  font:
    13px Georgia,
    serif;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}
.page-count span {
  color: #73737b;
  font-size: 11px;
}
.toolbar-hidden .reader-topbar {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%);
}
.toolbar-hidden .reader-bottombar {
  opacity: 0;
  pointer-events: none;
  transform: translateY(100%);
}
.toolbar-hidden .reader-rail {
  opacity: 0;
  pointer-events: none;
  transform: translate(120%, -50%);
}
.toolbar-hidden .horizontal-stage {
  --reader-page-height: 100svh;
  padding: 0;
}
.toolbar-hidden .page-zone,
.toolbar-hidden .toolbar-zone {
  top: 0;
  bottom: 0;
}
@media (max-width: 650px) {
  .reader-topbar {
    min-height: 52px;
    padding: 4px 6px;
  }
  .topbar-actions {
    gap: 0;
  }
  .work-info strong {
    max-width: 190px;
    font-size: 13px;
  }
  .work-info span {
    font-size: 9px;
  }
  .horizontal-stage {
    min-height: 100svh;
    padding: 52px 0 58px;
  }
  .page-spread,
  .page-spread.double {
    width: 100%;
    max-height: none;
  }
  .page-spread :deep(.comic-page),
  .page-spread.double :deep(.comic-page) {
    width: auto;
    max-width: none;
    height: min(var(--reader-page-height), 138.889vw);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.26);
  }
  .page-zone {
    top: 52px;
    bottom: 58px;
    width: 32%;
    min-width: 0;
  }
  .toolbar-zone {
    top: 52px;
    bottom: 58px;
  }
  .vertical-stage {
    gap: 8px;
    padding: 64px 0 60px;
  }
  .vertical-stage :deep(.comic-page) {
    width: min(100%, 480px);
    scroll-margin-top: 58px;
    box-shadow: none;
  }
  .chapter-opening,
  .chapter-ending {
    width: min(100%, 480px);
    min-height: 220px;
    padding: 24px 18px;
  }
  .chapter-opening h1 {
    margin: 13px 0 5px;
  }
  .chapter-ending {
    min-height: 200px;
  }
  .reader-rail {
    top: auto;
    right: 8px;
    bottom: 64px;
    flex-direction: row;
    padding: 3px;
    border-radius: 24px;
    transform: none;
  }
  .reader-rail :deep(.q-btn) {
    width: 38px;
    height: 38px;
    min-height: 38px;
  }
  .reader-panel {
    top: auto;
    right: 0;
    bottom: 58px;
    left: 0;
    width: 100%;
    max-height: 70svh;
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 0;
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -20px 45px rgba(0, 0, 0, 0.35);
  }
  .panel-header {
    padding-bottom: 14px;
  }
  .setting-group {
    margin-top: 18px;
  }
  .setting-group label span {
    color: var(--reader-accent);
  }
  .catalog-list button {
    min-height: 58px;
  }
  .slider-wrap {
    flex: 1;
  }
  .reader-bottombar {
    min-height: 58px;
    padding: 2px 7px;
  }
  .bottombar-nav-previous {
    left: 7px;
  }
  .bottombar-nav-next {
    right: 7px;
  }
  .progress-control {
    gap: 8px;
    width: calc(100% - 104px);
  }
  .page-count {
    min-width: 50px;
    font-size: 11px;
  }
  .toolbar-hidden .reader-rail {
    opacity: 0;
    pointer-events: none;
    transform: translateY(140%);
  }
}
</style>
