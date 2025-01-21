<template>
  <html-editor
    :mode="mode"
    :html="html"
    @update:html="emit('update:html', $event)"
    v-if="editorSetting.mode === 'html'"
  />
  <md-editor
    :mode="mode"
    :html="html"
    @update:html="emit('update:html', $event)"
    v-else-if="editorSetting.mode === 'markdown'"
  />
</template>

<script lang="ts" setup>
import { useSettingStore } from 'src/stores/setting'

import HtmlEditor from './Editor/Html.vue'
import MdEditor from './Editor/MarkDown.vue'

defineProps<{ mode: 'simple' | 'common'; html: string }>()

const emit = defineEmits(['update:html'])

const { editorSetting } = useSettingStore()
</script>

<style lang="scss"></style>
