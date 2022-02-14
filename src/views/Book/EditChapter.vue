<template>
  <div style="max-width: 1920px" class="mx-auto">
    <div v-if="isActive">
      <div class="q-gutter-sm">
        <q-input label="标题" v-model="chapter['Title']" />
        <div class="text-opacity">内容</div>
        <q-editor
          v-if="editorSetting.mode === 'html'"
          ref="editorRef"
          paragraph-tag="p"
          :definitions="{
            beautify: {
              tip: '格式化代码',
              label: '格式化',
              handler: beautify
            },
            bbcode: {
              tip: '转换BBCode',
              label: 'BBCode',
              handler: ShowBBCodePopup
            },
            removeFormat: { handler: removeFormat }
          }"
          :toolbar="[
            [
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify']
              }
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['fullscreen'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
              },
              {
                label: $q.lang.editor.fontSize,
                icon: $q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7']
              },
              'removeFormat'
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
            ['undo', 'redo'],
            ['viewsource', 'bbcode', 'beautify']
          ]"
          v-model="chapterContent"
          min-height="5rem"
        />
        <div>
          <md-editor
            v-if="editorSetting.mode === 'markdown'"
            v-model="markdownText"
            style="display: flex !important"
            :onHtmlChanged="onHtmlChanged"
            :theme="$q.dark.isActive ? 'dark' : 'light'"
            :toolbarsExclude="['image', 'save']"
          />
        </div>
      </div>
    </div>

    <div v-else class="absolute-full">
      <q-inner-loading :showing="!isActive" label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-fab
        :icon="icon.mdiPlus"
        direction="up"
        color="accent"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-fab-action color="primary" @click="save" :icon="icon.mdiContentSave" :disable="draggingFab">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            保存
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

    <q-dialog v-model="BBCodePopup">
      <q-card style="min-width: 800px">
        <q-card-section>
          <div class="text-h6">输入BBcode</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="BBCodeTextarea" autofocus filled type="textarea" @keyup.enter="BBCodePopup = false" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认转换" v-close-popup @click="BBCodeTransForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { watch, computed, nextTick, ref, toRaw } from 'vue'
import { icon } from '@/plugins/icon'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { getErrMsg } from '@/utils/getErrMsg'
import { useQuasar, debounce } from 'quasar'
import { getChapterEditInfo, editChapterContent } from '@/services/chapter'
import prettier from 'prettier/esm/standalone.mjs'
import parserHtml from 'prettier/esm/parser-html.mjs'
import { useSettingStore } from '@/store/setting'
import MdEditor from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import TurndownService from 'turndown'
import bbCodeParser from '@/utils/bbcode/simple'

const props = defineProps<{ bid: string; sortNum: string }>()
const bid = computed(() => ~~props.bid)
const sortNum = computed(() => ~~props.sortNum)
const chapter = ref<any>()
const fabPos = ref([18, 18])
const settingStore = useSettingStore()
const draggingFab = ref(false)
const editorRef = ref()
const BBCodePopup = ref(false)
const BBCodeTextarea = ref('')
const markdownText = ref('')
const turndownService = new TurndownService()

const clearHtml = debounce(function clearHtml(html: string) {
  if (html.indexOf('MsoNormal') !== -1) {
    console.log('本次可能从word粘贴内容')
    const el = editorRef.value.getContentEl() as Element
    el.querySelectorAll('.MsoNormal').forEach((item) => {
      item.classList.remove('MsoNormal')
      if (item.classList.length === 0) item.removeAttribute('class')
    })
    chapter.value['Content'] = el.innerHTML.replaceAll('<o:p></o:p>', '')
  }
}, 100)

const { editorSetting } = settingStore

const chapterContent = computed<string>({
  get() {
    return chapter.value['Content']
  },
  set(html) {
    chapter.value['Content'] = html
    clearHtml(html)
  }
})
const isActive = computed(() => chapter.value?.BookId === bid.value && chapter.value?.SortNum === sortNum.value)

const request = useTimeoutFn(async () => {
  chapter.value = await getChapterEditInfo({ BookId: bid.value, SortNum: sortNum.value })
  markdownText.value = turndownService.turndown(chapter.value['Content'])
})

watch(editorSetting, (newValue) => {
  if (newValue.mode === 'markdown') {
    markdownText.value = turndownService.turndown(chapter.value['Content'])
  }
})

const onHtmlChanged = (html: string) => {
  chapter.value['Content'] = html
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}
function beautify() {
  chapter.value['Content'] = prettier.format(chapter.value['Content'], {
    parser: 'html',
    plugins: [parserHtml]
  })
}
// BBCode 弹窗
const ShowBBCodePopup = () => {
  BBCodePopup.value = true
}
const BBCodeTransForm = () => {
  let arr = bbCodeParser.parse(BBCodeTextarea.value).split('\n')
  arr = arr.map((o: string) => {
    if (o.substr(0, 4) !== '<div') {
      o = '<p>' + o + '</p>'
    }
    return o
  })
  chapter.value['Content'] = arr.join('')
  BBCodeTextarea.value = ''
}

function removeFormat() {
  editorRef.value.runCmd('removeFormat')
  nextTick(() => {
    chapter.value['Content'] = chapter.value['Content'].replaceAll('style=""', '')
    chapter.value['Content'] = chapter.value['Content'].replace(/<span\s*?lang=".+?"\s*?>(.*?)<\/span>/gi, '$1')
  })
}

const $q = useQuasar()

async function save() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await editChapterContent(toRaw(chapter.value))

      $q.notify({
        type: 'positive',
        message: '修改成功'
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  })
}

useInitRequest(request, { isActive: isActive })
</script>

<style scoped lang="scss">
:deep(.q-editor__content) {
  @import '../../assets/style/read';
}
</style>
