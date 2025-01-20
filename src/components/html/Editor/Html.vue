<template>
  <div :class="mode">
    <q-editor
      ref="editorRef"
      paragraph-tag="p"
      :toolbar="toolbar"
      v-model="htmlContent"
      :definitions="definitions"
      @compositionstart="composing = true"
      @compositionend="composing = false"
    />

    <q-dialog v-model="inputBBCodeShow">
      <q-card style="width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">输入BBCode并转换</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense input-class="edit-input" v-model="inputBBCode" autofocus outlined autogrow type="textarea" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认转换" v-close-popup @click="BBCodeTransForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="inputHtmlShow">
      <q-card style="width: 800px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">输入HTML代码</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="inputHtml" input-class="edit-input" autofocus outlined autogrow type="textarea" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认输入" v-close-popup @click="htmlContent = inputHtml" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { format } from 'prettier'
import * as prettierPluginHtml from 'prettier/plugins/html.js'
import { debounce, useQuasar } from 'quasar'

import bbCodeParser from 'src/utils/bbcode/simple'

import type { QEditor, QEditorCommand } from 'quasar'
import { useEventListener } from '@vueuse/core'
import { useIsActivated } from 'src/composition/useIsActivated'

const props = defineProps<{ mode: 'simple' | 'common'; html: string }>()
const $q = useQuasar()
const emit = defineEmits(['update:html'])
let isInternalChange = false
const htmlContent = computed<string>({
  get() {
    return props.html
  },
  set(html) {
    isInternalChange = true
    emit('update:html', html)
  },
})

let composing = false
let history = []
let historyIndex = -1
const setHistory = debounce((newValue) => {
  if ((historyIndex === -1 || history[historyIndex] !== newValue) && !composing) {
    history = history.slice(0, historyIndex + 1)
    history.push(newValue)
    historyIndex++
  }
}, 50)
watch(
  htmlContent,
  (newValue) => {
    if (isInternalChange) {
      // 内部改变
      isInternalChange = false
    } else {
      // 外部改变
      composing = false
      history = []
      historyIndex = -1
    }

    setHistory(newValue)
  },
  { immediate: true },
)

const undo = () => {
  if (historyIndex > 0) {
    historyIndex--
    htmlContent.value = history[historyIndex]
  }
}

const redo = () => {
  if (historyIndex < history.length - 1) {
    historyIndex++
    htmlContent.value = history[historyIndex]
  }
}

let cleanup = () => {}
const isActive = useIsActivated()
watch(
  isActive,
  (value) => {
    if (value) {
      cleanup()
      cleanup = useEventListener('keydown', (e) => {
        if (e.ctrlKey) {
          if (e.key === 'z') {
            undo()
            e.preventDefault()
            e.stopPropagation()
          } else if (e.key === 'y') {
            redo()
            e.preventDefault()
            e.stopPropagation()
          }
        }
      })
    } else {
      cleanup()
    }
  },
  { immediate: true },
)

const SimpleToolbar = [
  ['left', 'center', 'right', 'justify'],
  ['bold', 'italic', 'underline', 'strike', 'dot'],
  ['myUndo', 'myRedo'],
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
  ['myUndo', 'myRedo'],
  ['code', 'bbcode'],
]
const toolbar = computed(() => {
  if (props.mode === 'simple') {
    return SimpleToolbar
  } else {
    return CommonToolbar
  }
})

const editorRef = ref<QEditor>()

// 俩弹窗
const inputHtmlShow = ref(false)
const inputHtml = ref('')
const inputBBCodeShow = ref(false)
const inputBBCode = ref('')
const ShowBBCodePopup = () => {
  inputBBCodeShow.value = true
}
const BBCodeTransForm = () => {
  let arr = bbCodeParser.parse(inputBBCode.value).split('\n')
  arr = arr.map((o: string) => {
    if (o === '') o = '<br />'
    if (!o.startsWith('<div') && !o.startsWith('<h')) {
      o = '<p>' + o + '</p>'
    }
    return o
  })
  htmlContent.value = arr.join('')

  inputBBCode.value = ''
}
async function showInputCode() {
  try {
    inputHtml.value = await htmlFormat(htmlContent.value)
  } catch (e) {
    inputHtml.value = htmlContent.value
  }

  inputHtmlShow.value = true
}

function removeFormat() {
  editorRef.value.runCmd('removeFormat')
}

const htmlFormat = async (html: string) => {
  return await format(html, {
    parser: 'html',
    plugins: [prettierPluginHtml],
  })
}
const htmlRubyHandler = () => {
  if (editorRef.value.caret.hasSelection) {
    const selectedText = editorRef.value.caret.range.toString()

    $q.dialog({
      title: '请输入注音内容',
      prompt: {
        model: '',
        type: 'text', // optional
      },
      cancel: true,
      persistent: true,
    }).onOk((data) => {
      const rubyStr = `<ruby>${selectedText}<rt>${data}</rt></ruby>`
      editorRef.value.caret.range.deleteContents()

      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = rubyStr
      const rubyNode = tempDiv.firstChild

      editorRef.value.caret.range.insertNode(rubyNode)

      const event = new Event('input', { bubbles: false })
      editorRef.value.getContentEl().dispatchEvent(event)
    })
  }
}
const htmlDotHandler = () => {
  if (editorRef.value.caret.hasSelection) {
    const span = document.createElement('span')
    span.classList.add('dot')

    span.appendChild(editorRef.value.caret.range.extractContents())
    editorRef.value.caret.range.insertNode(span)

    const event = new Event('input', { bubbles: false })
    editorRef.value.getContentEl().dispatchEvent(event)
  }
}

const definitions: Record<string, QEditorCommand> = {
  removeFormat: { handler: removeFormat },
  bbcode: { tip: '转换BBCode', label: 'BBCode', handler: ShowBBCodePopup },
  ruby: { tip: '插入注音', icon: 'mdiFuriganaHorizontal', handler: htmlRubyHandler },
  code: { tip: '输入源代码', icon: 'mdiCodeTags', handler: showInputCode },
  dot: { tip: '插入着重号', icon: 'mdiCircleDouble', handler: htmlDotHandler },
  myUndo: { tip: '撤销 (CTRL + Z)', icon: 'mdiUndo', handler: undo },
  myRedo: { tip: '重做 (CTRL + Y)', icon: 'mdiRedo', handler: redo },
}

function onUploadImg(files: Array<File>, callback: (urls: string[]) => void) {
  $q.notify({
    position: 'bottom',
    html: true,
    message: '暂时不支持上传图片，请使用链接',
    timeout: 2500,
  })
}
</script>

<style lang="scss" scoped>
.common {
  ::v-deep .q-editor__content {
    @import '../../../css/read';
  }
}
</style>
