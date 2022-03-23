/* eslint-disable vue/no-parsing-error */
<template>
  <div class="q-mx-auto container read-page" :style="['--width:' + settingStore['buildReaderWidth']]">
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
      <div
        ref="chapterRef"
        class="read"
        v-html="chapterContent"
        style="position: relative; z-index: 1"
        :style="readStyle"
        @click="manageScrollClick"
      />
      <q-tooltip
        :target="comment.target"
        v-html="comment.content"
        class="note-style"
        v-model="comment.showing"
        no-parent-event
        :max-width="$q.platform.is.mobile ? '90%' : '100%'"
      />
      <div v-if="readSetting['showButton']" class="row justify-between q-gutter-md" style="margin-top: 24px">
        <q-btn @click="prev" class="flex-space">上一章</q-btn>
        <q-btn @click="back" class="flex-space">目录</q-btn>
        <q-btn @click="next" class="flex-space">下一章</q-btn>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="fabPos" style="z-index: 1">
      <q-fab
        :icon="icon.mdiPlus"
        direction="up"
        color="accent"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-fab-action @click="next" color="primary" :icon="icon.mdiArrowRight" :disable="draggingFab">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            下一章
          </q-tooltip>
        </q-fab-action>
        <q-fab-action @click="prev" color="primary" :icon="icon.mdiArrowLeft" :disable="draggingFab">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            上一章
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          @click="showCatalog = true"
          color="primary"
          :icon="icon.mdiFormatListBulleted"
          :disable="draggingFab"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            目录
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="$q.fullscreen.isCapable && !readSetting['hideFullScreen']"
          @click="$q.fullscreen.toggle()"
          color="primary"
          :icon="$q.fullscreen.isActive ? icon.mdiFullscreenExit : icon.mdiFullscreen"
          :disable="draggingFab"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            {{ $q.fullscreen.isActive ? '退出全屏' : '全屏' }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="chapter?.CanEdit"
          color="primary"
          :to="{ name: 'EditChapter', param: { bid, sortNum } }"
          :icon="icon.mdiSquareEditOutline"
          :disable="draggingFab"
        >
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            快速编辑
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

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

    <div class="v-viewer" ref="viewerRef" v-viewer>
      <img :src="showImage.src" :alt="showImage.alt" />
    </div>
  </div>
</template>

<script lang="tsx" setup>
import { computed, defineComponent, nextTick, onActivated, onDeactivated, onMounted, reactive, ref, watch } from 'vue'
import { getChapterContent } from '@/services/chapter'
import { useQuasar, Dark, colors, debounce, scroll } from 'quasar'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { syncReading, scrollToHistory, loadHistory } from '@/utils/biz/read'
import { useLayout } from '@/components/app/useLayout'
import { useSettingStore } from '@/store/setting'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useAppStore } from '@/store'
import { useRouter } from 'vue-router'
import { icon } from '@/plugins/icon'
import { getErrMsg } from '@/utils/getErrMsg'
import { delay } from '@/utils/delay'
import { NOOP } from '@/const/empty'

const props = defineProps<{
  bid: string
  sortNum: string
}>()
defineComponent({ name: 'Read' })

const bid = computed(() => ~~(props.bid || '1'))
const sortNum = computed(() => ~~(props.sortNum || '1'))

const $q = useQuasar()
const chapter = ref<any>()
const chapterRef = ref<HTMLElement>()
const viewerRef = ref<HTMLElement>()
const comment = reactive({
  target: '',
  content: '',
  showing: false
})
const showCatalog = ref(false)
const layout = useLayout()
const { headerOffset } = layout
const appStore = useAppStore()
const settingStore = useSettingStore()
const cid = computed(() => chapter.value?.Id || 1)
const userId = computed(() => appStore.userId)
const showImage = reactive({
  src: null,
  alt: ''
})
const fabPos = ref([18, 18])
const draggingFab = ref(false)
function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

const getContent = useTimeoutFn(async () => {
  try {
    let res: any = await getChapterContent({
      Bid: bid.value,
      SortNum: sortNum.value,
      Convert: settingStore.readSetting.convert
    })
    chapter.value = res.Chapter
    $q.notify({
      message: chapter.value['Title'],
      color: 'purple',
      timeout: 1500
    })
    ;(async () => {
      if (res.ReadPosition && res.ReadPosition.Cid === res.Chapter.Id) {
        await delay(200)
        await nextTick(() => {
          scrollToHistory(chapterRef.value, res.ReadPosition.XPath, headerOffset)
        })
      }
    })().then(NOOP)
  } catch (error) {
    $q.notify({
      message: getErrMsg(error),
      color: 'negative',
      timeout: 1500
    })
  }
})

if (!CSS.supports('line-break', 'anywhere')) {
  let message = '对不起，您的浏览器似乎无法完美使用本网站，请使用Chrome(80以上)或FireFox浏览器'
  $q.notify({
    message,
    color: 'purple',
    timeout: 3000,
    position: 'bottom'
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
  backgroundColor: readSetting.bgType === 'custom' ? readSetting.customColor : 'initial'
}))

//改用StyleValue
const readStyle = computed(() => [
  'fontSize:' + readSetting.fontSize + 'px',
  'textAlign:' + readSetting.justify ? 'justify' : 'initial',
  'color:' + readSetting.bgType === 'custom'
    ? colors.brightness(readSetting.customColor) < 128
      ? '#fff'
      : '#000'
    : 'inherit'
])

const router = useRouter()
const next = debounce(() => {
  if (sortNum.value === chapter.value?.Chapters?.length) {
    $q.notify({
      type: 'secondary',
      position: 'bottom',
      timeout: 1500,
      message: '已经是最后一页了'
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
      message: '已经是第一页了'
    })
  } else {
    router.replace({ name: 'Read', params: { bid: bid.value, sortNum: sortNum.value - 1 } })
  }
}, 300)

function back() {
  router.push({ name: 'BookInfo', params: { id: bid.value } })
}

function previewImg(event) {
  showImage.src = event.target.src
  showImage.alt = event.target.alt
  // @ts-ignore
  viewerRef.value.$viewer.show()
  event.stopPropagation()
  globalCancelShowing(event)
}

function showComment(event: MouseEvent, html: string, id: string) {
  event.stopPropagation()
  if (comment.target !== `#${id}`) {
    comment.target = `#${id}`
    comment.content = html
  }
  if (!comment.showing) {
    comment.showing = true
  }
}

function globalCancelShowing(event: any) {
  if (!event.target.hasAttribute('global-cancel')) {
    comment.showing = false
  }
}

function manageScrollClick(event: any) {
  // @ts-ignore
  if (readSetting.tapToScroll && !viewerRef.value.$viewer.isShown) {
    let h = window.innerHeight
    if (event.y < 0.25 * h || event.y > 0.75 * h) {
      let target = scroll.getScrollTarget(chapterRef.value)
      let offset = scroll.getVerticalScrollPosition(target)
      scroll.setVerticalScrollPosition(target, event.y < 0.25 * h ? offset - h * 0.75 : offset + h * 0.75, 200) // 最后一个参数为duration
    }
  }
}

function manageKeydown(event: KeyboardEvent) {
  // @ts-ignore
  if (viewerRef.value.$viewer.isShown) return // 显示图片时不予响应
  if (event.code === 'ArrowRight') {
    next()
  } else if (event.code === 'ArrowLeft') {
    prev()
  }
}

onActivated(() => {
  document.addEventListener('click', globalCancelShowing)
  document.addEventListener('keydown', manageKeydown)
})
onDeactivated(() => {
  document.removeEventListener('click', globalCancelShowing)
  document.removeEventListener('keydown', manageKeydown)
})

onMounted(getContent.syncCall)
watch(
  () => [bid.value, sortNum.value],
  async () => {
    comment.showing = false
    comment.target = ''
    await getContent()
  }
)

// 如果章节变了，重新观察dom记录阅读记录
watch(
  () => chapter.value?.Id,
  () => {
    nextTick(async () => {
      chapterRef.value.querySelectorAll('.duokan-image-single img').forEach((element: any) => {
        element.onclick = previewImg
      })

      chapterRef.value.querySelectorAll('.duokan-footnote').forEach((element: HTMLElement) => {
        const id = element.getAttribute('href').replace('#', '')
        //获取注释内容
        const commentElement = document.getElementById(id)
        const content = commentElement.innerHTML
        // 隐藏内容
        commentElement.style.display = 'none'
        element.removeAttribute('href')
        element.id = `v-${id}`
        element.setAttribute('global-cancel', 'true')
        if ($q.platform.is.mobile) {
          element.onclick = (event) => showComment(event, content, `v-${id}`)
        } else {
          element.onmouseenter = (event) => showComment(event, content, `v-${id}`)
          element.onmouseleave = () => (comment.showing = false)
        }
      })
      await syncReading(chapterRef.value, userId, { BookId: bid, CId: cid }, headerOffset)
    })
  }
)
onActivated(async () => {
  if (sortNum.value === chapter.value?.SortNum) {
    let position = await loadHistory(userId.value, bid.value)
    // todo 这里有bug，浏览器前进按钮行为很奇怪
    if (position && position.cid === cid.value) scrollToHistory(chapterRef.value, position.xPath, headerOffset)
  }
})

// 字体设置
const style = document.createElement('style')
style.type = 'text/css'
style.id = 'read_style'
document.head.append(style)
watch(
  () => chapter.value?.Font,
  () => {
    let fontUrl = chapter.value?.Font
    if (fontUrl) {
      if (!fontUrl.startsWith('http')) fontUrl = VUE_APP_API_SERVER + fontUrl
      style.innerHTML = `@font-face{font-family:read;font-display: block;src:url(${fontUrl});}`
    }
  }
)

const loading = computed(() => chapter.value?.BookId !== bid.value || chapter.value['SortNum'] !== sortNum.value)
const chapterContent = computed(() => sanitizerHtml(chapter.value['Content']))
</script>

<style scoped lang="scss">
.read-bg {
  z-index: 0;
}

.v-viewer {
  display: none;
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
    all: unset;
    user-select: none;
  }

  @import '../../assets/style/read';

  font-family: read, sans-serif !important;

  * {
    line-break: anywhere;
  }
}

/*居中功能*/
.read-page {
  @import '../../styles/quasar.variables';

  @media screen and (min-width: $breakpoint-md-min) {
    width: var(--width);
    max-width: 100%;
    min-width: 300px;
  }
}
</style>
