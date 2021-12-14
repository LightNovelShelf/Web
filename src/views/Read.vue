<template>
  <div v-if="chapter['BookId'] !== ~~(bid || '1') || chapter['SortNum'] !== ~~(sortNum || '1')">
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
import { computed, defineComponent, nextTick, onActivated, ref } from 'vue'
import { getChapterContent } from '@/services/chapter'
import { useQuasar, Dark, colors } from 'quasar'
import sanitizerHtml from '@/utils/sanitizeHtml'
import { syncReading } from '@/utils/read'
import { useLayoutStore } from '@/components/app/useLayout'
import { useSettingStore } from '@/store/setting'

export default defineComponent({
  name: 'Read',
  props: {
    bid: [String, Number],
    sortNum: [String, Number]
  },
  setup(props) {
    const $q = useQuasar()
    const chapter = ref<any>({})
    const chapterRef = ref(null)
    const layoutStore = useLayoutStore()
    const getContent = async () => {
      chapter.value = await getChapterContent({ Bid: ~~(props.bid || '1'), SortNum: ~~(props.sortNum || '1') })
      $q.notify({
        message: chapter.value['Title'],
        color: 'purple',
        timeout: 1500
      })
      // TODO 这里在每次getContent时执行，会反复调用，之后得尝试改进一下
      // nextTick(() => {
      //   syncReading(chapterRef.value, 0, { BookId: ~~props.bid, Id: ~~props.sortNum }, layoutStore.headerHeight)
      // })
    }

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

    onActivated(getContent)

    return {
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
.clear {
  clear: both;
}
:deep(.read) {
  all: unset;
  all: revert;

  p {
    margin: 0 0 0.5em 0;
    text-indent: 2em;
  }

  /*图片相关*/
  .illus,
  .illu,
  .duokan-image-single {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
  }

  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }

  .duokan-image-single img {
    box-shadow: black 0 0 3px;
    box-sizing: border-box;
    margin: 5px 0;
    cursor: pointer;
    border: 1px solid white;
  }

  .change-image {
    display: none;
  }

  @media screen and (min-device-aspect-ratio: 5/4) {
    .change {
      display: none;
    }

    .change-image {
      display: flex;
      margin: 5px 0;
    }
  }

  /*注释相关*/
  img.footnote {
    display: inline-block;
  }

  .duokan-footnote-item {
    font-size: 0.8em;
    color: #960014;
    font-weight: bold;
    text-align: left;
    text-indent: 0;
    a {
      color: #960014;
      text-decoration: none;
    }
  }

  aside ol {
    list-style: none;
    margin: 0;
    padding: 10px;
  }

  a.duokan-footnote {
    position: relative;
    aside {
      position: absolute;
      z-index: 12;
      background: #fff;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      transform-origin: center center;
      transition: transform 0.2s;
      cursor: default;
      // transform: scale(0.2);
    }
  }

  a.duokan-footnote img {
    height: 1em;
    vertical-align: text-top;
  }

  sup {
    vertical-align: text-top;
  }

  /*标题相关*/
  .pius1,
  .ph4,
  .pius2,
  h4 {
    font-size: 1.5em;
    font-weight: bold;
    text-indent: 1.333em;
    margin: 0.5em 0 1em 0;
  }

  h1 {
    font-size: 1.65em;
    line-height: 120%;
    text-align: center;
    font-weight: bold;
    margin-top: 0.1em;
    margin-bottom: 0.4em;
  }

  h2 {
    font-size: 1.25em;
    line-height: 120%;
    text-align: center;
    font-weight: bold;
    margin-top: 0.3em;
    margin-bottom: 0.5em;
  }

  h3 {
    font-size: 0.95em;
    line-height: 120%;
    text-align: center;
    text-indent: 0;
    font-weight: bold;
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }

  /*文字大小*/

  .em05 {
    font-size: 0.5em;
  }

  .em06 {
    font-size: 0.6em;
  }

  .em07 {
    font-size: 0.7em;
  }

  .em08 {
    font-size: 0.8em;
  }

  .em09 {
    font-size: 0.9em;
  }

  .em11 {
    font-size: 1.1em;
  }

  .em12 {
    font-size: 1.2em;
  }

  .em13 {
    font-size: 1.3em;
  }

  .em14 {
    font-size: 1.4em;
  }

  .em15 {
    font-size: 1.5em;
  }

  .em16 {
    font-size: 1.6em;
  }

  .em17 {
    font-size: 1.7em;
  }

  .em18 {
    font-size: 1.8em;
  }

  .em19 {
    font-size: 1.9em;
  }

  .em20 {
    font-size: 2em;
  }

  .em21 {
    font-size: 2.1em;
  }

  .em22 {
    font-size: 2.2em;
  }

  .em23 {
    font-size: 2.3em;
  }

  .em24 {
    font-size: 2.4em;
  }

  .em25 {
    font-size: 2.5em;
  }

  .em26 {
    font-size: 2.6em;
  }

  .em27 {
    font-size: 2.7em;
  }

  .em28 {
    font-size: 2.8em;
  }

  .em29 {
    font-size: 2.9em;
  }

  .em30 {
    font-size: 3em;
  }

  /*预设格式相关样式*/

  .right {
    text-indent: 0;
    text-align: right;
  }

  .left {
    text-indent: 0;
    text-align: left;
  }

  .center {
    text-indent: 0;
    text-align: center;
  }

  .zin {
    text-indent: 0;
  }

  .bold {
    font-weight: bold;
  }

  .ita {
    font-style: italic;
  }

  .stress {
    font-weight: bold;
    font-size: 1.1em;
    margin-top: 0.3em;
    margin-bottom: 0.3em;
  }

  .author {
    font-size: 1.2em;
    text-align: right;
    font-weight: bold;
    font-style: italic;
    margin-right: 1em;
  }

  .dash-break {
    word-break: break-all;
    word-wrap: break-word;
  }

  .no-d {
    text-decoration: none;
  }

  .bc {
    border-collapse: collapse;
  }

  .dash-break {
    word-break: break-all;
    word-wrap: break-word;
  }

  .message,
  .cut-line {
    text-indent: 0;
    line-height: 1.2em;
    margin-top: 0.2em;
    margin-bottom: 0.2em;
  }

  .meg {
    font-size: 1.3em;
    line-height: 1.3em;
    margin: 0.5em 0 0 0;
    text-indent: 0;
  }

  .lh {
    line-height: 1em;
  }

  .m0 {
    margin: 0;
  }

  .p0 {
    padding: 0;
  }

  /*RGB颜色*/
  .red {
    color: #ff0000;
    //background-color: initial !important;
  }

  .green {
    color: #00ff00;
    //background-color: initial !important;
  }

  .blue {
    color: #0000ff;
    //background-color: initial !important;
  }

  .black {
    color: #000000;
    //background-color: initial !important;
  }

  .white {
    color: #ffffff;
    //background-color: initial !important;
  }

  /*float*/
  .fl {
    float: left;
  }

  .fr {
    float: right;
  }

  .cl {
    clear: left;
  }

  .cr {
    clear: right;
  }

  .cb {
    clear: both;
  }

  /*对齐*/
  .vt {
    vertical-align: top;
  }

  .vb {
    vertical-align: bottom;
  }

  .vm {
    vertical-align: middle;
  }

  /*格校着重号*/
  .dot,
  .em-dot {
    -webkit-text-emphasis-style: filled dot;
    -webkit-text-emphasis-position: under right;
    text-emphasis: circle var(--dot-color);
    text-emphasis-position: under right;
  }
}
</style>
