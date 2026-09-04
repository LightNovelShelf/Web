<template>
  <q-page padding style="max-width: 1920px" class="items-center flex fit">
    <book-info-fields v-if="isActive && book" v-model="book" :category-options="categoryOptions" />

    <div v-else class="absolute-full">
      <q-inner-loading showing label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <editor-save-action :disabled="saving || !isActive" @save="save" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue'

import { useSettingStore } from '@/stores/setting'

import { BookInfoFields, EditorSaveAction } from '@/components/editor'
import { buildBookCategoryOptions, toBookInfoUpdate } from '@/components/editor/bookEditOptions'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useEditorAction } from '@/composition/editor/useEditorAction'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { editBook, getBookEditInfo } from '@/services/book'

import type { BookCategoryOption } from '@/components/editor/bookEditOptions'
import type { EditableBook } from '@/services/book/types'

const props = defineProps<{ bid: string }>()
const bid = computed(() => Number(props.bid))
const book = ref<EditableBook>()
const categoryOptions = ref<BookCategoryOption[]>([])
const isActive = computed(() => book.value?.Id === bid.value)
const { activeEditorMode } = useSettingStore()
const { saving, runEditorAction } = useEditorAction()

const request = useTimeoutFn(async () => {
  const data = await getBookEditInfo(bid.value, activeEditorMode)
  categoryOptions.value = buildBookCategoryOptions(data)
  book.value = data.Book
})

async function save() {
  if (!book.value) return
  const currentBook = book.value
  await runEditorAction({ content: currentBook.Introduction, confirmWhenClean: true }, () =>
    editBook(bid.value, toRaw(toBookInfoUpdate(currentBook))),
  )
}

useInitRequest(request, { isActive })
</script>
