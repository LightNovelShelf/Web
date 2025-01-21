<template>
  <div :class="mode">
    <md-editor
      v-model="markdownText"
      editorId="md-introduction"
      :onHtmlChanged="onHtmlChanged"
      :sanitize="sanitizeHtml"
      :onUploadImg="onUploadImg"
      style="height: calc(100vh - 190px)"
      :theme="$q.dark.isActive ? 'dark' : 'light'"
      :toolbars="mdToolBar"
      noMermaid
      noKatex
    >
    </md-editor>
  </div>
</template>

<script lang="ts" setup>
import TurndownService from '@joplin/turndown'
import { gfm } from '@joplin/turndown-plugin-gfm'
import { MdEditor } from 'md-editor-v3'
import { format } from 'prettier'
import * as prettierPluginHtml from 'prettier/plugins/html.js'
import { useQuasar } from 'quasar'
import { computed, nextTick, ref, watch } from 'vue'

import { useSettingStore } from 'stores/setting'

import type { ToolbarNames } from 'md-editor-v3'

import 'md-editor-v3/lib/style.css'

const props = defineProps<{ mode: 'simple' | 'common'; html: string }>()
const $q = useQuasar()
const emit = defineEmits(['update:html'])
const htmlContent = computed<string>({
  get() {
    return props.html
  },
  set(html) {
    emit('update:html', html)
  },
})
const settingStore = useSettingStore()
const { editorSetting } = settingStore

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
turndownService.use(gfm)
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

<style lang="scss" scoped>
.common {
  :deep(.md-editor-preview) {
    @import '../../../css/read';
  }
}

:deep(.md-editor-preview) {
  p {
    padding: unset;
  }
}
</style>
