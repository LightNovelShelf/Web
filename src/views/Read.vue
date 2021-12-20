<template>
  <div>
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
      />
      <div class="row justify-between q-gutter-md" style="margin-top: 24px">
        <q-btn @click="prev" class="flex-space">上一章</q-btn>
        <q-btn @click="back" class="flex-space">目录</q-btn>
        <q-btn @click="next" class="flex-space">下一章</q-btn>
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="fabPos">
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
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, nextTick, onActivated, onMounted, ref, watch } from 'vue'
import { getChapterContent } from '@/services/chapter'
import { useQuasar, Dark, colors, debounce } from 'quasar'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { syncReading, scrollToHistory, loadHistory } from '@/utils/biz/read'
import { useLayout } from '@/components/app/useLayout'
import { useSettingStore } from '@/store/setting'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useAppStore } from '@/store'
import { useRouter } from 'vue-router'
import { icon } from '@/plugins/icon'
import { getErrMsg } from '@/utils/getErrMsg'

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
const layout = useLayout()
const { headerOffset } = layout
const appStore = useAppStore()
const cid = computed(() => chapter.value?.Id || 1)
const userId = computed(() => appStore.userId)

const fabPos = ref([18, 18])
const draggingFab = ref(false)
function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

const getContent = useTimeoutFn(async () => {
  try {
    let res: any = await getChapterContent({ Bid: bid.value, SortNum: sortNum.value })
    chapter.value = res.Chapter
    $q.notify({
      message: chapter.value['Title'],
      color: 'purple',
      timeout: 1500
    })
    if (res.ReadPosition && res.ReadPosition.Cid === res.Chapter.Id) {
      nextTick(() => {
        scrollToHistory(chapterRef.value, res.ReadPosition.XPath, headerOffset)
      })
    }
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

const settingStore = useSettingStore()
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
const readStyle = computed(() => ({
  fontSize: readSetting.fontSize + 'px',
  color:
    readSetting.bgType === 'custom' ? (colors.brightness(readSetting.customColor) < 128 ? '#fff' : '#000') : 'inherit'
}))

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
    router.push({ name: 'Read', params: { bid: bid.value, sortNum: sortNum.value + 1 } })
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
    router.push({ name: 'Read', params: { bid: bid.value, sortNum: sortNum.value - 1 } })
  }
}, 300)
function back() {
  router.push({ name: 'BookInfo', params: { id: bid.value } })
}

onMounted(getContent.syncCall)
watch(() => [bid.value, sortNum.value], getContent)
// 如果章节变了，重新观察dom记录阅读记录
watch(
  () => chapter.value?.Id,
  () => {
    nextTick(async () => {
      await syncReading(chapterRef.value, userId, { BookId: bid, CId: cid }, headerOffset)
    })
  }
)
onActivated(async () => {
  if (cid.value === chapter.value?.Id) {
    let position = await loadHistory(userId.value, bid.value)
    if (position) scrollToHistory(chapterRef.value, position.xPath, headerOffset)
  }
})

const loading = computed(() => chapter.value?.BookId !== bid.value || chapter.value['SortNum'] !== sortNum.value)
const chapterContent = computed(() => sanitizerHtml(chapter.value['Content']))
</script>

<style scoped lang="scss">
.read-bg {
  z-index: 0;
}

:deep(.read) {
  @import 'src/assets/style/read';

  line-break: anywhere;
  font-family: read, sans-serif !important;
}
</style>
