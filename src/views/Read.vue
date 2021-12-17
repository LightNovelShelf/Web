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
import { computed, defineComponent, nextTick, onActivated, ref, watchEffect } from 'vue'
import { getChapterContent } from '@/services/chapter'
import { useQuasar, Dark, colors } from 'quasar'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { syncReading } from '@/utils/read'
import { useLayoutStore } from '@/components/app/useLayout'
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
    const layoutStore = useLayoutStore()
    const appStore = useAppStore()
    const getContent = useTimeoutFn(async () => {
      chapter.value = await getChapterContent({ Bid: bid.value, SortNum: sortNum.value })
      $q.notify({
        message: chapter.value['Title'],
        color: 'purple',
        timeout: 1500
      })
      // TODO 这里在每次getContent时执行，会反复调用，之后得尝试改进一下
      // nextTick(() => {
      //   syncReading(
      //     chapterRef.value,
      //     appStore.user.Id,
      //     { BookId: ~~props.bid, Id: chapter.value.Id },
      //     layoutStore.headerHeight
      //   )
      // })
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

    useInitRequest(getContent)

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
