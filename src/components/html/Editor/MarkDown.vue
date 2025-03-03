<template>
  <div :class="mode">
    <md-editor
      ref="editorRef"
      v-model="markdownText"
      :onHtmlChanged="onHtmlChanged"
      :onUploadImg="onUploadImg"
      style="height: calc(100vh - 200px)"
      :theme="$q.dark.isActive ? 'dark' : 'light'"
      :toolbars="mdToolBar"
      :sanitize="sanitize"
      noMermaid
      noKatex
      noImgZoomIn
      noHighlight
      autoDetectCode
      :showCodeRowNumber="false"
      :codeFoldable="false"
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
      </template>
    </md-editor>
  </div>
</template>

<script lang="ts" setup>
import TurndownService from '@joplin/turndown'
import { gfm } from '@joplin/turndown-plugin-gfm'
import { MdEditor, NormalToolbar   } from 'md-editor-v3'
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue'

import sanitizerHtml from 'src/utils/sanitizeHtml'

import { uploadImage } from 'src/services/user'

import type {ToolbarNames, ExposeParam} from 'md-editor-v3';

import 'cropperjs/dist/cropper.css'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ mode: 'simple' | 'common'; html: string }>()
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
    const res = await uploadImage({ FileName: file.name, ImageData: new Uint8Array(await file.arrayBuffer()) })
    urls.push(res.Url)
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
const turndownService = new TurndownService({ codeBlockStyle: 'fenced', headingStyle: 'atx' })
turndownService.use(gfm)
turndownService.keep(['ruby', 'rt'])
// 去掉代码的工具栏
turndownService.addRule('ignoreCodeTool', {
  filter: function (node) {
    return node.classList && node.classList.contains('md-editor-code-action')
  },
  replacement: function (content, node, options) {
    return ''
  },
})
// 保留着重号
turndownService.addRule('preserveDot', {
  filter: function (node) {
    return node.classList && node.classList.contains('dot')
  },
  replacement: function (content, node) {
    return node.outerHTML // 保留元素的外部 HTML
  },
})
// 保留<br>
turndownService.addRule('convertPBrToBr', {
  filter: function (node) {
    return node.nodeName === 'BR'
  },
  replacement: function (content, node) {
    return '<br>\r\n'
  },
})

let isInternalChange = false

const onHtmlChanged = (html: string) => {
  isInternalChange = true
  emit('update:html', html)
}

watch(
  () => props.html,
  (html) => {
    if (isInternalChange) {
      isInternalChange = false
    } else {
      // 对外部html的改变做初始化
      markdownText.value = turndownService.turndown(html)
    }
  },
  { immediate: true },
)
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

  .illus,
  .illu,
  .duokan-image-single {
    padding: 0 5px;
  }
}
</style>
