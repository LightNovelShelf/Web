<template>
  <html-editor
    :mode="mode"
    :html="content"
    :style="editorStyle"
    @update:html="emit('update:html', $event)"
    v-if="editorMode === 'html'"
  />
  <md-editor
    :mode="mode"
    :markdown="content"
    :style="editorStyle"
    @update:html="emit('update:html', $event)"
    v-else-if="editorMode === 'markdown'"
  />
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

<style lang="scss"></style>
