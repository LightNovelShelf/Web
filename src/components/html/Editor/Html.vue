<template>
  <div :class="mode">
    <q-editor
      ref="editorRef"
      paragraph-tag="p"
      :toolbar="toolbar"
      v-model="htmlContent"
      :definitions="definitions"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      @paste="onPaste"
    />
    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" multiple @change="onFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import * as prettierPluginHtml from 'prettier/plugins/html'
import { format } from 'prettier/standalone'
import { debounce, useQuasar } from 'quasar'

import bbCodeParser from 'src/utils/bbcode/simple'
import sanitizerHtml from 'src/utils/sanitizeHtml'

import { useIsActivated } from 'src/composition/useIsActivated'

import { uploadImage } from 'src/services/user'

import type { QEditor, QEditorCommand } from 'quasar'

const props = defineProps<{ mode: 'simple' | 'common'; html: string }>()
const $q = useQuasar()
const emit = defineEmits(['update:html'])
let isInternalChange = false

const processHtml = (html: string) => {
  const div = document.createElement('div')
  div.innerHTML = html
  const pTags = div.querySelectorAll('p')
  let changed = false
  pTags.forEach((p) => {
    const children = Array.from(p.children)
    const childNodes = Array.from(p.childNodes)

    const hasOnlyOneImg = children.length === 1 && children[0].tagName === 'IMG'
    const hasNoText = childNodes.every((node) => node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())

    if (hasOnlyOneImg && hasNoText) {
      const newDiv = document.createElement('div')
      newDiv.classList.add('illus')
      newDiv.innerHTML = p.innerHTML
      Array.from(p.attributes).forEach((attr) => {
        newDiv.setAttribute(attr.name, attr.value)
      })
      p.replaceWith(newDiv)
      changed = true
    }
  })
  return changed ? div.innerHTML : html
}

const htmlContent = computed<string>({
  get() {
    return props.html
  },
  set(html) {
    isInternalChange = true
    emit('update:html', processHtml(html))
  },
})

let composing = false

function onCompositionStart() {
  composing = true
}

function onCompositionEnd() {
  composing = false
}
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

// 事件处理
function removeFormat() {
  editorRef.value.runCmd('removeFormat')
}

const htmlFormat = async (html: string) => {
  return await format(html, {
    parser: 'html',
    plugins: [prettierPluginHtml],
  })
}
const insertRuby = () => {
  if (editorRef.value.caret.hasSelection) {
    const selectedText = editorRef.value.caret.range.toString()

    $q.dialog({
      title: '请输入注音内容',
      prompt: {
        model: '',
        type: 'text', // optional
      },
      cancel: true,
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
const insertDot = () => {
  if (editorRef.value.caret.hasSelection) {
    const span = document.createElement('span')
    span.classList.add('dot')

    span.appendChild(editorRef.value.caret.range.extractContents())
    editorRef.value.caret.range.insertNode(span)

    const event = new Event('input', { bubbles: false })
    editorRef.value.getContentEl().dispatchEvent(event)
  }
}
const inputHtml = async () => {
  let html = ''
  try {
    html = await htmlFormat(htmlContent.value)
  } catch (e) {
    html = htmlContent.value
  }

  $q.dialog({
    title: '输入HTML代码',
    prompt: {
      model: html,
      type: 'textarea',
      dense: true,
      autofocus: true,
      outlined: true,
      autogrow: true,
    },
    cancel: true,
    class: 'html-input',
  }).onOk((data) => {
    htmlContent.value = sanitizerHtml(data)
  })
}
const inputBBCode = () => {
  $q.dialog({
    title: '输入BBCode',
    prompt: {
      model: '',
      type: 'textarea',
      dense: true,
      autofocus: true,
      outlined: true,
      autogrow: true,
    },
    cancel: true,
    class: 'html-input',
  }).onOk((data) => {
    let arr = bbCodeParser.parse(data).split('\n')
    arr = arr.map((o: string) => {
      if (o === '') o = '<br />'
      if (!o.startsWith('<div') && !o.startsWith('<h')) {
        o = '<p>' + o + '</p>'
      }
      return o
    })
    htmlContent.value = arr.join('')
  })
}

const fileInputRef = ref<HTMLInputElement>()
const pickImage = () => {
  fileInputRef.value?.click()
}

const handleUpload = async (files: FileList | File[]) => {
  if (!files || files.length === 0) return

  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: '上传中...',
    caption: `0/${files.length}`,
  })

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = await uploadImage({ FileName: file.name, ImageData: new Uint8Array(await file.arrayBuffer()) })

      editorRef.value?.runCmd('insertImage', url)

      notif({
        caption: `${i + 1}/${files.length}`,
      })
    }
    notif({
      icon: 'mdiCheck',
      spinner: false,
      message: '上传完成',
      timeout: 1000,
    })
  } catch (error) {
    notif({
      type: 'negative',
      message: '上传失败',
      timeout: 2000,
    })
  }
}

const onFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  await handleUpload(files)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const onPaste = async (evt: ClipboardEvent) => {
  const files = evt.clipboardData?.files
  if (files && files.length > 0) {
    evt.preventDefault()
    evt.stopPropagation()
    await handleUpload(files)
  }
}

const definitions: Record<string, QEditorCommand> = {
  removeFormat: { handler: removeFormat },
  bbcode: { tip: '转换BBCode', label: 'BBCode', handler: inputBBCode },
  ruby: { tip: '插入注音', icon: 'mdiFuriganaHorizontal', handler: insertRuby },
  code: { tip: '输入源代码', icon: 'mdiCodeTags', handler: inputHtml },
  dot: { tip: '插入着重号', icon: 'mdiCircleDouble', handler: insertDot },
  myUndo: { tip: '撤销 (CTRL + Z)', icon: 'mdiUndo', handler: undo },
  myRedo: { tip: '重做 (CTRL + Y)', icon: 'mdiRedo', handler: redo },
  image: { tip: '插入图片', icon: 'mdiImage', handler: pickImage },
}
</script>

<style lang="scss" scoped>
.common {
  :deep(.q-editor__content) {
    @import '../../../css/read';
  }
}
</style>

<style lang="scss">
.html-input {
  width: 1000px;
  max-width: 90vw;

  .q-dialog-plugin__form {
    max-height: 75vh;
  }
}
</style>
