<template>
  <div class="column gap-8">
    <q-input label="标题" v-model="chapter.Title" />
    <div class="text-opacity">内容</div>
    <html-editor
      :content="chapter.Content ?? ''"
      content-type="novel-body"
      @update:html="chapter.Content = $event"
      mode="common"
    />
  </div>
</template>

<script lang="ts" setup>
import { HtmlEditor } from '@/components'

import type { ChapterTextContent } from '@/services/chapter/types'

const chapter = defineModel<ChapterTextContent>({ required: true })
</script>
