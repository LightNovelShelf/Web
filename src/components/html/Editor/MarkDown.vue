<template>
  <div :class="mode">
    <md-editor
      ref="editorRef"
      v-model="markdownText"
      :onHtmlChanged="onHtmlChanged"
      :onUploadImg="onUploadImg"
      :theme="$q.dark.isActive ? 'dark' : 'light'"
      :toolbars="mdToolBar"
      :sanitize="sanitize"
      noMermaid
      noKatex
      noEcharts
      noImgZoomIn
      noHighlight
      :showCodeRowNumber="false"
    >
      <template #defToolbars>
        <NormalToolbar title="插入注音" @click="insertRuby">
          <template #trigger>
            <q-icon name="mdiFuriganaHorizontal" />
          </template>
        </NormalToolbar>
        <NormalToolbar title="插入着重号" @click="insertDot">
          <template #trigger>
            <q-icon name="mdiCircleDouble" />
          </template>
        </NormalToolbar>
        <NormalToolbar title="插入脚注" @click="insertFootnote">
          <template #trigger>
            <q-icon name="mdiTextBoxOutline" />
          </template>
        </NormalToolbar>
      </template>
    </md-editor>
  </div>
</template>

<script lang="ts" setup>
import { MdEditor, NormalToolbar } from 'md-editor-v3'
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

import sanitizerHtml from '@/utils/sanitizeHtml'

import { uploadImage } from '@/services/user'

import type { ToolbarNames, ExposeParam } from 'md-editor-v3'

import 'cropperjs/dist/cropper.css'
import 'md-editor-v3/lib/style.css'

// markdown 由服务端转换后下发（编辑接口 Format=markdown），编辑结果一律以 Html 抛回去
const props = defineProps<{ mode: 'simple' | 'common'; markdown: string }>()
const $q = useQuasar()
const editorRef = ref<ExposeParam>()
const emit = defineEmits(['update:html'])

const mdToolBar: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  0,
  1,
  2,
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  '=',
  'prettier',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
]

const markdownText = ref('')
const insertRuby = () => {
  $q.dialog({
    title: '请输入注音内容',
    prompt: {
      model: '',
      type: 'text',
    },
    cancel: true,
  }).onOk((data) => {
    editorRef.value.insert((selectText) => {
      return {
        targetValue: `<ruby>${selectText}<rt>${data}</rt></ruby>`,
        select: true,
        deviationStart: 0,
        deviationEnd: 0,
      }
    })
  })
}
const insertDot = () => {
  editorRef.value.insert((selectText) => {
    return {
      targetValue: `<span class="dot">${selectText}</span>`,
      select: true,
      deviationStart: 0,
      deviationEnd: 0,
    }
  })
}
function nextFootnoteLabel(markdown: string) {
  const labels = new Set(Array.from(markdown.matchAll(/\[\^([^\]\r\n]+)\]/g), (match) => match[1].toLowerCase()))
  for (let number = 1; ; number++) {
    const label = `note-${number}`
    if (!labels.has(label)) return label
  }
}

function footnoteDefinition(label: string, value: string) {
  const [firstLine, ...otherLines] = value.trim().replace(/\r\n?/g, '\n').split(/\n+/)
  const continuation = otherLines.map((line) => `\n    \n    ${line}`).join('')
  return `[^${label}]: ${firstLine}${continuation}`
}

function insertFootnote() {
  $q.dialog({
    title: '添加脚注',
    prompt: {
      model: '',
      type: 'textarea',
      label: '注释内容',
      outlined: true,
      autofocus: true,
      isValid: (value) => value.trim().length > 0,
    },
    cancel: true,
  }).onOk((value: string) => {
    const view = editorRef.value?.getEditorView()
    if (!view) return

    const markdown = view.state.doc.toString()
    const { from, to } = view.state.selection.main
    const selectedText = markdown.slice(from, to)
    const label = nextFootnoteLabel(markdown)
    const marker = `[^${label}]`
    const markerText = selectedText + marker
    const content = markdown.slice(0, from) + markerText + markdown.slice(to)
    const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n'
    const definition = separator + footnoteDefinition(label, value)
    const cursor = from + markerText.length

    if (to === markdown.length) {
      view.dispatch({
        changes: { from, to, insert: markerText + definition },
        selection: { anchor: cursor },
      })
      return
    }

    view.dispatch({
      changes: [
        { from, to, insert: markerText },
        { from: markdown.length, insert: definition },
      ],
      selection: { anchor: cursor },
    })
  })
}
function sanitize(html: string) {
  html = sanitizerHtml(html)
  return html
}
async function onUploadImg(files: Array<File>, callback: (urls: string[]) => void) {
  const notif = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: '上传中...',
    caption: `0/${files.length}`,
  })

  const urls: string[] = []
  for (const file of files) {
    const { Url } = await uploadImage({
      FileName: file.name,
      ImageData: new Uint8Array(await file.arrayBuffer()),
    })
    urls.push(Url)
    notif({
      caption: `${urls.length}/${files.length}`,
    })
  }

  notif({
    icon: 'mdiCheck',
    spinner: false,
    message: '',
    timeout: 1000,
  })

  // 手动插入图片
  editorRef.value.insert((selectText) => {
    return {
      targetValue: urls.map((url) => `![](${url})`).join('\r\n\r\n'),
      select: false,
      deviationStart: 0,
      deviationEnd: 0,
    }
  })
}

let lastEmittedHtml: string | undefined

const onHtmlChanged = (html: string) => {
  lastEmittedHtml = html
  emit('update:html', html)
}

watch(
  () => props.markdown,
  (markdown) => {
    // 父组件回填的是本组件刚抛出的 Html，回填它会把正在编辑的 Markdown 冲掉
    if (markdown === lastEmittedHtml) return

    markdownText.value = markdown
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.common {
  height: calc(100vh - 200px);
  min-height: 500px;

  :deep(.md-editor) {
    height: 100%;
    min-height: 0;
  }

  :deep(.md-editor-preview) {
    @import '../../../css/read';
  }
}

.simple {
  :deep(.md-editor) {
    height: calc(100vh - 200px);
  }
}

:deep(.md-editor-preview) {
  p {
    padding: unset;
  }

  .illus,
  .illu,
  .duokan-image-single {
    padding: 0 5px;
  }
}
</style>
