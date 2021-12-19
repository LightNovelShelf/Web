<template>
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onActivated, onMounted, ref, watch, watchEffect } from 'vue'
import { getChapterContent } from '@/services/chapter'
import { useQuasar, Dark, colors } from 'quasar'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { syncReading, scrollToHistory, loadHistory } from '@/utils/biz/read'
import { useLayout } from '@/components/app/useLayout'
import { useSettingStore } from '@/store/setting'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useAppStore } from '@/store'

export default defineComponent({
  name: 'Read',
  props: {
    bid: [String, Number],
    sortNum: [String, Number]
  },
  setup(props) {
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

    const getContent = useTimeoutFn(async () => {
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
        readSetting.bgType === 'custom'
          ? colors.brightness(readSetting.customColor) < 128
            ? '#fff'
            : '#000'
          : 'inherit'
    }))

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
        console.log(position)
        if (position) scrollToHistory(chapterRef.value, position.xPath, headerOffset)
      }
    })

    return {
      loading: computed(() => chapter.value?.BookId !== bid.value || chapter.value['SortNum'] !== sortNum.value),
      chapterContent: computed(() => sanitizerHtml(chapter.value['Content'])),
      chapterRef,
      chapter,
      readStyle,
      bgStyle
    }
  }
})
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
