<template>
  <div>
    <q-editor
      v-if="editorSetting.mode === 'html'"
      ref="editorRef"
      paragraph-tag="p"
      :toolbar="toolbar"
      v-model="htmlContent"
      :definitions="{
        beautify: { tip: '格式化代码', label: '格式化', handler: beautify },
        bbcode: { tip: '转换BBCode', label: 'BBCode', handler: ShowBBCodePopup },
        removeFormat: { handler: removeFormat }
      }"
      min-height="5rem"
    />
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
    <div>
      <md-editor
        v-if="editorSetting.mode === 'markdown'"
        v-model="markdownText"
        :onHtmlChanged="onHtmlChanged"
        style="display: flex !important"
        :theme="$q.dark.isActive ? 'dark' : 'light'"
        :toolbarsExclude="['image', 'save']"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue'

import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useQuasar, debounce } from 'quasar'
import prettier from 'prettier/esm/standalone.mjs'
import parserHtml from 'prettier/esm/parser-html.mjs'
import { useSettingStore } from '@/store/setting'
import bbCodeParser from '@/utils/bbcode/simple'
import TurndownService from 'turndown'
import MdEditor from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ mode: 'simple' | 'common'; html: string }>()
const $q = useQuasar()
const emit = defineEmits(['update:html'])
const htmlContent = computed<string>({
  get() {
    return props.html
  },
  set(html) {
    clearHtml(html)
    emit('update:html', html)
  }
})

const SimpleToolbar = [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'underline', 'strike'],
  ['undo', 'redo'],
  ['viewsource']
]
const CommonToolbar = [
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
]
const toolbar = computed(() => {
  if (props.mode === 'simple') {
    return SimpleToolbar
  } else {
    return CommonToolbar
  }
})
const chapter = ref<any>()
const fabPos = ref([18, 18])
const draggingFab = ref(false)
const editorRef = ref()
const BBCodePopup = ref(false)
const BBCodeTextarea = ref('')
const settingStore = useSettingStore()
const { editorSetting } = settingStore
const turndownService = new TurndownService()
const markdownText = ref('')

const request = useTimeoutFn(async () => {
  markdownText.value = turndownService.turndown(htmlContent.value)
})

const clearHtml = debounce(function clearHtml(html: string) {
  if (html.indexOf('MsoNormal') !== -1) {
    console.log('本次可能从word粘贴内容')
    const el = editorRef.value.getContentEl() as Element
    el.querySelectorAll('.MsoNormal').forEach((item) => {
      item.classList.remove('MsoNormal')
      if (item.classList.length === 0) item.removeAttribute('class')
    })
    htmlContent.value = el.innerHTML.replaceAll('<o:p></o:p>', '')
  }
}, 100)

const onHtmlChanged = (html: string) => {
  htmlContent.value = html
}

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}
function beautify() {
  htmlContent.value = prettier.format(htmlContent.value, {
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
    if (o.substring(0, 4) !== '<div') {
      o = '<p>' + o + '</p>'
    }
    return o
  })
  htmlContent.value = arr.join('')
  BBCodeTextarea.value = ''
}

function removeFormat() {
  editorRef.value.runCmd('removeFormat')
  nextTick(() => {
    htmlContent.value = htmlContent.value.replaceAll('style=""', '')
    htmlContent.value = htmlContent.value.replace(/<span\s*?lang=".+?"\s*?>(.*?)<\/span>/gi, '$1')
  })
}

useInitRequest(request)
</script>
