<template>
  <div class="html-editor" :style="editorStyle">
    <html-editor :mode="mode" :html="content" @update:html="emit('update:html', $event)" v-if="editorMode === 'html'" />
    <md-editor
      :mode="mode"
      :markdown="content"
      @update:html="emit('update:html', $event)"
      v-else-if="editorMode === 'markdown'"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useSettingStore } from '@/stores/setting'

import HtmlEditor from './Editor/Html.vue'
import MdEditor from './Editor/MarkDown.vue'

// 页面加载时固定编辑器格式，设置变更只在刷新后生效
type EditorContentType = 'forum-post' | 'book-introduction' | 'novel-body'

const props = defineProps<{ mode: 'simple' | 'common'; content: string; contentType: EditorContentType }>()
const settingStore = useSettingStore()
const editorStyle = computed(() =>
  props.contentType === 'novel-body' && settingStore.readSetting.firstLineIndent
    ? { '--read-paragraph-indent': '2em' }
    : undefined,
)

const emit = defineEmits(['update:html'])

const editorMode = settingStore.activeEditorMode
</script>

<style lang="scss" scoped>
.html-editor {
  height: calc(100vh - 200px);
  height: calc(100dvh - 200px);
  min-height: 0;
  overflow: hidden;
}

:deep(.common),
:deep(.simple),
:deep(.q-editor),
:deep(.md-editor) {
  height: 100%;
  min-height: 0;
}

:deep(.q-editor) {
  position: relative;
  display: flex;
  max-height: 100%;
  flex-direction: column;
}

:deep(.q-editor__content) {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
}

:deep(.md-editor) {
  max-height: 100%;
}

:deep(.md-editor-content) {
  min-height: 0;
  overflow: hidden;
}
</style>
