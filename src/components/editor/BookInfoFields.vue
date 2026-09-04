<template>
  <q-grid class="book-info-fields" x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
    <q-grid-item>
      <div class="book-info-fields__stack column gap-8">
        <div class="text-opacity">封面预览</div>
        <q-card>
          <system-image v-if="book.Cover" :url="book.Cover" :request-height="1024" :ratio="2 / 3" />
          <q-responsive v-else :ratio="2 / 3">
            <q-skeleton class="fit" square />
          </q-responsive>
        </q-card>
      </div>
    </q-grid-item>
    <q-grid-item span="2" xs="1" sm="1" md="1">
      <div class="book-info-fields__stack column gap-8">
        <image-input v-model="book.Cover" />
        <q-input :label="book.Type === 'Comic' ? '漫画名' : '书名'" v-model="book.Title" />
        <q-input label="作者" v-model="book.Author" />
        <div class="text-opacity">简介</div>
        <html-editor
          :content="book.Introduction"
          content-type="book-introduction"
          @update:html="book.Introduction = $event"
          mode="simple"
        />
        <q-select map-options emit-value v-model="book.CategoryId" :options="categoryOptions" label="分类" />
      </div>
    </q-grid-item>
  </q-grid>
</template>

<script lang="ts" setup>
import { HtmlEditor, ImageInput } from '@/components'
import { QGrid, QGridItem } from '@/components/grid'
import SystemImage from '@/components/SystemImage.vue'

import type { BookCategoryOption } from '@/components/editor/bookEditOptions'
import type { EditableBook } from '@/services/book/types'

const book = defineModel<EditableBook>({ required: true })
defineProps<{ categoryOptions: BookCategoryOption[] }>()
</script>

<style scoped>
.book-info-fields,
.book-info-fields__stack,
.book-info-fields__stack > * {
  min-width: 0;
  max-width: 100%;
}
</style>
