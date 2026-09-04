<template>
  <html-editor :mode="mode" :html="content" @update:html="emit('update:html', $event)" v-if="editorMode === 'html'" />
  <md-editor
    :mode="mode"
    :markdown="content"
    @update:html="emit('update:html', $event)"
    v-else-if="editorMode === 'markdown'"
  />
</template>

<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting'

import HtmlEditor from './Editor/Html.vue'
import MdEditor from './Editor/MarkDown.vue'

// 页面加载时固定编辑器格式，设置变更只在刷新后生效
defineProps<{ mode: 'simple' | 'common'; content: string }>()

const emit = defineEmits(['update:html'])

const editorMode = useSettingStore().activeEditorMode
</script>

<style lang="scss"></style>
