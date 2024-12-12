<template>
  <div :class="mode">
    <q-editor
      v-if="editorSetting.mode === 'html'"
      ref="editorRef"
      paragraph-tag="p"
      :toolbar="toolbar"
      v-model="htmlContent"
      :definitions="definitions"
      min-height="5rem"
    >
    </q-editor>

    <q-dialog v-model="BBCodePopup">
      <q-card style="width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">输入BBCode</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            input-class="edit-input"
            v-model="BBCodeTextarea"
            autofocus
            outlined
            autogrow
            type="textarea"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认转换" v-close-popup @click="BBCodeTransForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="inputCodeShow">
      <q-card style="width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">输入HTML代码</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="htmlCodeTextarea"
            input-class="edit-input"
            autofocus
            outlined
            autogrow
            type="textarea"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认输入" v-close-popup @click="htmlContent = htmlCodeTextarea" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div>
      <md-editor
        v-if="editorSetting.mode === 'markdown'"
        v-model="markdownText"
        editorId="md-introduction"
        :onHtmlChanged="onHtmlChanged"
        :sanitize="sanitizeHtml"
        :onUploadImg="onUploadImg"
        style="display: flex !important; height: calc(100vh - 180px)"
        :theme="$q.dark.isActive ? 'dark' : 'light'"
        :toolbars="mdToolBar"
      >
        <template #defToolbars>
          <MdEditor.NormalToolbar title="插入注音" @click="mdRubyHandler">
            <template #trigger>
              <svg class="md-editor-icon" aria-hidden="true">
                <path
                  d="M8.5 2C7.12 2 6 3.12 6 4.5S7.12 7 8.5 7 11 5.88 11 4.5 9.88 2 8.5 2M15.5 2C14.12 2 13 3.12 13 4.5S14.12 7 15.5 7 18 5.88 18 4.5 16.88 2 15.5 2M11 8V10H5V12H14.95C14.53 13.13 13.5 14.5 12.16 15.67C11.12 14.74 10.35 13.82 9.82 13H7.5C8.08 14.25 9.13 15.62 10.62 16.96L6.55 20.22L5.76 20.84L7 22.41L7.8 21.78L12.17 18.28L16.55 21.78L17.33 22.41L18.58 20.84L17.8 20.22L13.73 16.97C15.34 15.5 16.7 13.85 17.07 12H19V10H13V8H11Z"
                />
              </svg>
            </template>
          </MdEditor.NormalToolbar>
          <MdEditor.NormalToolbar title="插入着重号" @click="mdDotHandler">
            <template #trigger>
              <svg class="md-editor-icon" aria-hidden="true">
                <path
                  d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 2a8 8 0 0 1 8 8a8 8 0 0 1-8 8a8 8 0 0 1-8-8a8 8 0 0 1 8-8m0 2a6 6 0 0 0-6 6a6 6 0 0 0 6 6a6 6 0 0 0 6-6a6 6 0 0 0-6-6m0 2a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4Z"
                />
              </svg>
            </template>
          </MdEditor.NormalToolbar>
        </template>
      </md-editor>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MdEditor } from 'md-editor-v3'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { useQuasar, debounce } from 'quasar'
import TurndownService from 'turndown'
import { computed, nextTick, ref, watch } from 'vue'

import bbCodeParser from 'src/utils/bbcode/simple'

import { useSettingStore } from 'stores/setting'

import type { ToolbarNames } from 'md-editor-v3'
import type { QEditorCommand } from 'quasar'

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
  },
})
const settingStore = useSettingStore()
const { editorSetting } = settingStore

const SimpleToolbar = [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'underline', 'strike', 'dot'],
  ['undo', 'redo'],
  ['removeFormat', 'code'],
]
const CommonToolbar = [
  [
    {
      label: $q.lang.editor.align,
      icon: $q.iconSet.editor.align,
      fixedLabel: true,
      list: 'only-icons',
      options: ['left', 'center', 'right', 'justify'],
    },
  ],
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript', 'ruby', 'dot'],
  ['hr', 'link', 'image'],
  ['fullscreen'],
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
    },
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'],
    },
    'removeFormat',
  ],
  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
  ['undo', 'redo'],
  ['code', 'bbcode'],
]
const toolbar = computed(() => {
  if (props.mode === 'simple') {
    return SimpleToolbar
  } else {
    return CommonToolbar
  }
})

const chapter = ref<any>()
const editorRef = ref()
const inputCodeShow = ref(false)
const htmlCodeTextarea = ref('')
const BBCodePopup = ref(false)
const BBCodeTextarea = ref('')
// BBCode 弹窗
const ShowBBCodePopup = () => {
  BBCodePopup.value = true
}
const BBCodeTransForm = () => {
  let arr = bbCodeParser.parse(BBCodeTextarea.value).split('\n')
  arr = arr.map((o: string) => {
    if (o === '') o = '<br />'
    if (!o.startsWith('<div') && !o.startsWith('<h')) {
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
const clearHtml = debounce(function clearHtml(html: string) {
  if (html.indexOf('MsoNormal') !== -1) {
    console.log('本次可能从word粘贴内容')
    const el = editorRef.value.getContentEl() as Element
    el.querySelectorAll('.MsoNormal').forEach((item) => {
      item.classList.remove('MsoNormal')
      if (item.classList.length === 0) item.removeAttribute('class')
    })
    emit('update:html', el.innerHTML.replaceAll('<o:p></o:p>', ''))
  }
}, 100)
const htmlRubyHandler = () => {
  const selection = window.getSelection()?.toString()
  if (!selection) return
  const rubyStr = `<ruby>${selection}<rt>注音内容</rt></ruby>`
  editorRef.value.runCmd('insertHTML', rubyStr)
}
const htmlDotHandler = () => {
  const selection = window.getSelection()?.toString()
  if (!selection) return
  const dotStr = `<span class="dot">${selection}</span>`
  editorRef.value.runCmd('insertHTML', dotStr)
}
async function showInputCode() {
  try {
    htmlCodeTextarea.value = await prettier.format(htmlContent.value, {
      parser: 'html',
      plugins: [parserHtml],
    })
  } catch (e) {
    htmlCodeTextarea.value = htmlContent.value
  }

  inputCodeShow.value = true
}
const definitions: Record<string, QEditorCommand> = {
  removeFormat: { handler: removeFormat },
  bbcode: { tip: '转换BBCode', label: 'BBCode', handler: ShowBBCodePopup },
  ruby: { tip: '插入注音', icon: 'mdiFuriganaHorizontal', handler: htmlRubyHandler },
  code: { tip: '输入源代码', icon: 'mdiCodeTags', handler: showInputCode },
  dot: { tip: '插入着重号', icon: 'mdiCircleDouble', handler: htmlDotHandler },
}

// MdEditor.config({
//   markedRenderer(renderer) {
//     renderer.image = (href: string, title: string, desc: string) => {
//       return `<div class="illus duokan-image-single"><img src="${href}" alt="${desc || ''}"></div>`
//     }
//     renderer.heading = (text, level, raw, s, index) => {
//       return `<h${level} id="heading-${index}">${text}</h${level}>`
//     }
//     return renderer
//   },
// })
const mdToolBar: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'link',
  'image',
  'table',
  0,
  1,
  '-',
  'revoke',
  'next',
  '=',
  'prettier',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog',
]
const turndownService = new TurndownService()
turndownService.keep(['ruby', 'rt'])
const markdownText = ref('')
const mdRubyHandler = () => {
  const textarea = document.querySelector('#md-introduction-textarea') as HTMLTextAreaElement
  const selection = window.getSelection()
  const endPoint = textarea.selectionStart

  if (!selection?.anchorNode?.contains(textarea) || !selection?.focusNode?.contains(textarea)) {
    return
  }

  const rubyStr = selection
    ? `<ruby>${selection.toString()}<rt>注音内容</rt></ruby>`
    : '<ruby>被注音文字<rt>注音内容</rt></ruby>'

  const prefixStr = textarea.value.substring(0, endPoint)
  const suffixStr = textarea.value.substring(endPoint + (selection?.toString().length || 0))

  markdownText.value = `${prefixStr}${rubyStr}${suffixStr}`

  setTimeout(() => {
    textarea.setSelectionRange(endPoint, rubyStr.length + endPoint)
    textarea.focus()
  }, 0)
}
const mdDotHandler = () => {
  const textarea = document.querySelector('#md-introduction-textarea') as HTMLTextAreaElement
  const selection = window.getSelection()
  const endPoint = textarea.selectionStart

  if (!selection?.anchorNode?.contains(textarea) || !selection?.focusNode?.contains(textarea)) {
    return
  }

  const dotStr = selection ? `<span class="dot">${selection.toString()}</span>` : '<span class="dot">着重号</span>'

  const prefixStr = textarea.value.substring(0, endPoint)
  const suffixStr = textarea.value.substring(endPoint + (selection?.toString().length || 0))

  markdownText.value = `${prefixStr}${dotStr}${suffixStr}`

  setTimeout(() => {
    textarea.setSelectionRange(endPoint, dotStr.length + endPoint)
    textarea.focus()
  }, 0)
}
function sanitizeHtml(html: string) {
  // 这里可以对markdown生成的代码进行一些自定义
  html = html.replace(/<p>(<div class="illus duokan-image-single">.*?<\/div>)<\/p>/gi, '$1')
  return html
  // return `<div class="md-editor">${html}</div>`
}
function onUploadImg(files: Array<File>, callback: (urls: string[]) => void) {
  $q.notify({
    position: 'bottom',
    html: true,
    message: '暂时不支持上传图片，请使用链接',
    timeout: 2500,
  })
}

// 第一次进来初始化
const parseMarkDown = () => {
  if (editorSetting.mode === 'markdown') {
    markdownText.value = turndownService.turndown(htmlContent.value).replace(/^ {2}$/gm, '<br>')
  }
}
parseMarkDown()
watch(
  () => props.html,
  () => {
    if (!isChange.value) {
      //console.log('change')
      parseMarkDown()
    } else {
      isChange.value = false
    }
  },
)

const isChange = ref(false)
const onHtmlChanged = (html: string) => {
  // MarkDown模式下不需要清理代码
  isChange.value = true
  emit('update:html', html)
}
watch(editorSetting, parseMarkDown)
</script>

<style lang="scss">
.common {
  .q-editor--default .q-editor__content,
  .md-editor-preview {
    @import '../../css/read';
  }
}

.md-editor-preview {
  p {
    padding: unset;
  }
}

.edit-input {
  max-height: calc(100vh - 250px);
}
</style>
