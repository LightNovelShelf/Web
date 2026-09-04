<template>
  <html-editor
    :mode="mode"
    :html="content"
    @update:html="emit('update:html', $event)"
    v-if="editorSetting.mode === 'html'"
  />
  <md-editor
    :mode="mode"
    :markdown="content"
    @update:html="emit('update:html', $event)"
    v-else-if="editorSetting.mode === 'markdown'"
  />
</template>

<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting'

import HtmlEditor from './Editor/Html.vue'
import MdEditor from './Editor/MarkDown.vue'

// content 的格式由 editorSetting.mode 决定（html 或服务端转换好的 markdown），编辑结果一律是 Html
defineProps<{ mode: 'simple' | 'common'; content: string }>()

const emit = defineEmits(['update:html'])

const { editorSetting } = useSettingStore()
</script>

<style lang="scss"></style>
