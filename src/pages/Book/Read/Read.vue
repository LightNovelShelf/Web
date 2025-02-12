<template>
  <q-page padding class="q-mx-auto container">
    <div v-if="loading">
      <q-skeleton type="text" height="50px" width="50%" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
      <q-skeleton type="text" height="50px" />
      <q-skeleton type="text" height="100px" />
    </div>
    <div v-else>
      <div class="read-bg absolute-top-left fit" :style="bgStyle" />
      <div class="read-page q-mx-auto" :style="['--width:' + settingStore['buildReaderWidth']]">
        <html-reader
          :html="chapterContent"
          :style="readStyle"
          style="position: relative; z-index: 1"
          ref="readerRef"
          class="read"
        ></html-reader>
        <q-tooltip
          :target="note.target"
          class="note-style"
          ref="noteElement"
          v-model="note.showing"
          no-parent-event
          :max-width="$q.platform.is.mobile ? '90%' : '100%'"
        >
          <div v-html="note.content" />
        </q-tooltip>
      </div>
      <div
        v-if="readSetting['showButton']"
        class="row justify-between q-gutter-md"
        style="margin-top: 24px; clear: both"
      >
        <q-btn @click="prev" class="flex-space">上一章</q-btn>
        <q-btn @click="back" class="flex-space">目录</q-btn>
        <q-btn @click="next" class="flex-space">下一章</q-btn>
      </div>
    </div>

    <drag-page-sticky v-slot="{ isDragging }">
      <q-fab icon="mdiPlus" direction="up" color="accent" :disable="isDragging">
        <q-fab-action @click="next" color="primary" icon="mdiArrowRight" :disable="isDragging">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            下一章
          </q-tooltip>
        </q-fab-action>
        <q-fab-action @click="prev" color="primary" icon="mdiArrowLeft" :disable="isDragging">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            上一章
          </q-tooltip>
        </q-fab-action>
        <q-fab-action @click="showCatalog = true" color="primary" icon="mdiFormatListBulleted" :disable="isDragging">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            目录
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          @click="toggleDark"
          color="primary"
          :icon="Dark.mode === 'auto' ? 'mdiBrightnessAuto' : Dark.mode ? 'mdiWeatherNight' : 'mdiWeatherSunny'"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            切换颜色模式
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="$q.fullscreen.isCapable && !readSetting['hideFullScreen']"
          @click="$q.fullscreen.toggle()"
          color="primary"
          :icon="$q.fullscreen.isActive ? 'mdiFullscreenExit' : 'mdiFullscreen'"
          :disable="isDragging"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            {{ $q.fullscreen.isActive ? '退出全屏' : '全屏' }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="chapter?.CanEdit"
          color="primary"
          :to="{ name: 'EditChapter', param: { bid, sortNum } }"
          icon="mdiSquareEditOutline"
          :disable="isDragging"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            快速编辑
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </drag-page-sticky>

    <q-dialog v-model="showCatalog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <q-infinite-scroll style="max-height: 80vh">
            <q-list dense>
              <q-item
                v-for="(item, index) in chapter['Chapters']"
                :key="index"
                replace
                :to="{ name: 'Read', params: { bid, sortNum: index + 1 } }"
              >
                <q-item-section>{{ item }}</q-item-section>
              </q-item>
            </q-list>
          </q-infinite-scroll>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { useQuasar, Dark, colors, debounce } from 'quasar'
import {
  computed,
  defineComponent,
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import { delay } from 'src/utils/delay'
import { getErrMsg } from 'src/utils/getErrMsg'
import sanitizerHtml from 'src/utils/sanitizeHtml'

import { useAppStore } from 'stores/app'
import { useSettingStore } from 'stores/setting'

import { DragPageSticky } from 'components'
import { useLayout } from 'components/app/useLayout'
import HtmlReader from 'components/html/HtmlReader.vue'

import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { NOOP } from 'src/const/empty'
import { PROVIDE } from 'src/const/provide'
import { apiServer } from 'src/services/apiServer'
import { getChapterContent } from 'src/services/chapter'

import { syncReading, scrollToHistory, loadHistory } from './history'

const props = defineProps<{
  bid: string
  sortNum: string
}>()
defineComponent({ name: 'Read' })

const bid = computed(() => ~~(props.bid || '1'))
const sortNum = computed(() => ~~(props.sortNum || '1'))

const $q = useQuasar()
const layout = useLayout()
const { headerOffset } = layout
const appStore = useAppStore()
const settingStore = useSettingStore()
const imagePreview = inject<any>(PROVIDE.IMAGE_PREVIEW)

const chapter = ref<any>()
const noteElement = ref()
const readerRef = ref()
const note = reactive({
  target: '',
  content: '',
  showing: false,
})
const showCatalog = ref(false)
const cid = computed(() => chapter.value?.Id || 1)
const userId = computed(() => appStore.userId)
const loading = computed(() => chapter.value?.BookId !== bid.value || chapter.value['SortNum'] !== sortNum.value)
const chapterContent = computed(() => sanitizerHtml(chapter.value['Content']))

const getContent = useTimeoutFn(async () => {
  try {
    const res: any = await getChapterContent({
      Bid: bid.value,
      SortNum: sortNum.value,
      Convert: settingStore.readSetting.convert,
    })
    chapter.value = res.Chapter
    $q.notify({
      message: chapter.value['Title'],
      color: 'purple',
      timeout: 1500,
    })
    ;(async () => {
      if (res.ReadPosition && res.ReadPosition.Cid === res.Chapter.Id) {
        await delay(200)
        await nextTick(() => {
          scrollToHistory(readerRef.value!.contentRef, res.ReadPosition.XPath, headerOffset)
        })
      }
    })().then(NOOP)
  } catch (error) {
    $q.notify({
      message: getErrMsg(error),
      color: 'negative',
      timeout: 1500,
    })
  }
})

if (!CSS.supports('line-break', 'anywhere')) {
  const message = '对不起，您的浏览器似乎无法完美使用本网站，请使用Chrome(80以上)或FireFox浏览器'
  $q.notify({
    message,
    color: 'purple',
    timeout: 3000,
    position: 'bottom',
  })
}

const { readSetting } = settingStore
const bgStyle = computed(() => ({
  backgroundImage:
    readSetting.bgType === 'paper'
      ? Dark.isActive
        ? 'url("/img/bg-paper-dark.jpeg")'
        : 'url("/img/bg-paper.jpg")'
      : 'initial',
  backgroundColor: readSetting.bgType === 'custom' ? readSetting.customColor : 'initial',
}))

const { dark } = storeToRefs(settingStore)
watch(dark, (newDark) => {
  Dark.set(newDark)
  settingStore.save()
})
function toggleDark() {
  if (Dark.mode === 'auto') {
    dark.value = !Dark.isActive
  } else {
    dark.value = !Dark.mode
  }
}

const readStyle = computed(() => ({
  fontSize: readSetting.fontSize + 'px',
  textAlign: readSetting.justify ? 'justify' : 'initial',
  color:
    readSetting.bgType === 'custom' ? (colors.brightness(readSetting.customColor) < 128 ? '#fff' : '#000') : 'inherit',
}))

const router = useRouter()
const next = debounce(() => {
  if (sortNum.value === chapter.value?.Chapters?.length) {
    $q.notify({
      type: 'secondary',
      position: 'bottom',
      timeout: 1500,
      message: '已经是最后一页了',
    })
  } else {
    router.replace({ name: 'Read', params: { bid: bid.value, sortNum: sortNum.value + 1 } })
  }
}, 300)
const prev = debounce(() => {
  if (sortNum.value === 1) {
    $q.notify({
      type: 'secondary',
      position: 'bottom',
      timeout: 1500,
      message: '已经是第一页了',
    })
  } else {
    router.replace({ name: 'Read', params: { bid: bid.value, sortNum: sortNum.value - 1 } })
  }
}, 300)
function back() {
  router.push({ name: 'BookInfo', params: { bid: bid.value } })
}

function manageKeydown(event: KeyboardEvent) {
  if (imagePreview.isShow) return // 显示图片时不予响应
  if (event.code === 'ArrowRight') {
    next()
  } else if (event.code === 'ArrowLeft') {
    prev()
  }
}

onActivated(() => {
  document.addEventListener('keydown', manageKeydown)
})
onDeactivated(() => {
  document.removeEventListener('keydown', manageKeydown)
})

onMounted(() => {
  getContent.syncCall()
})

watch(
  () => [bid.value, sortNum.value],
  async () => {
    note.showing = false
    note.target = ''
    await getContent()
  },
)

// 如果章节变了，重新观察dom记录阅读记录，处理注释
watch(
  () => chapter.value?.Id,
  () => {
    nextTick(async () => {
      readerRef.value.contentRef.querySelectorAll('.duokan-footnote').forEach((element: HTMLElement) => {
        const id = element.getAttribute('href')!.replace('#', '')
        //获取注释内容
        const noteElement = document.getElementById(id)!
        const content = noteElement.innerHTML
        // 隐藏内容
        noteElement.style.display = 'none'
        element.removeAttribute('href')
        element.setAttribute('global-cancel', 'true')
        element.id = `v-${id}`
        if ($q.platform.is.mobile) {
          element.onclick = (event) => showNote(event, content, `v-${id}`)
        } else {
          element.onmouseenter = (event) => showNote(event, content, `v-${id}`)
          element.onmouseleave = () => (note.showing = false)
        }
      })
      await syncReading(readerRef.value.contentRef, userId, { BookId: bid, CId: cid }, headerOffset)
    })
  },
)

function globalCancelShowing(event: any) {
  const target = event.target
  if (!target.hasAttribute('global-cancel') && !target.parentElement.hasAttribute('global-cancel')) {
    note.showing = false
  }
}

function showNote(event: MouseEvent, html: string, id: string) {
  event.stopPropagation()
  if (note.target !== `#${id}`) {
    note.target = `#${id}`
    note.content = html
  }
  if (!note.showing) {
    note.showing = true
  }
}
if ($q.platform.is.mobile) {
  // 实际上是点不到 noteElement 里面的
  onClickOutside(noteElement, globalCancelShowing)
}

onActivated(() => {
  if (sortNum.value === chapter.value?.SortNum && bid.value === chapter.value?.BookId) {
    const position = loadHistory(userId.value, bid.value)
    if (position && position.cid === cid.value) {
      if (position.top) {
        document.scrollingElement!.scrollTop = position.top
      } else {
        scrollToHistory(readerRef.value.contentRef, position.xPath, headerOffset)
      }
    }
  }
})

// 字体设置
const style = document.createElement('style')
style.id = 'read_style'
document.head.append(style)
watch(
  () => chapter.value?.Font,
  () => {
    let fontUrl = chapter.value?.Font
    if (fontUrl) {
      if (!fontUrl.startsWith('http')) fontUrl = apiServer.value + fontUrl
      style.innerHTML = `@font-face{font-family:read;font-display: block;src:url(${fontUrl});}`
    }
  },
)
</script>

<style scoped lang="scss">
.read-bg {
  z-index: 0;
}

// 注释
:global(.note-style) {
  font-family: read, sans-serif !important;
  line-break: anywhere;
  font-size: 1rem;
}

:global(.note-style ol) {
  list-style: none;
  margin: 0;
  padding: 10px;
}

:deep(.read) {
  & {
    user-select: none;
    font-family: read, sans-serif !important;
  }

  * {
    line-break: anywhere;
  }
}

/*居中功能*/
.read-page {
  @media screen and (min-width: $breakpoint-md-min) {
    width: var(--width);
    max-width: 100%;
    min-width: 300px;
  }
}
</style>
