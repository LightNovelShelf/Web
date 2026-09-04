<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <novel-chapter-fields v-if="isActive && chapter" v-model="chapter" />

    <div v-else class="absolute-full">
      <q-inner-loading showing label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <editor-save-action :disabled="saving || !isActive" @save="save" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue'

import { useSettingStore } from '@/stores/setting'

import { EditorSaveAction, NovelChapterFields } from '@/components/editor'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useEditorAction } from '@/composition/editor/useEditorAction'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { getNovelEditInfo, updateNovelChapter } from '@/services/chapter'

import type { ChapterEditState } from '@/services/chapter/types'

const props = defineProps<{ bid: string; sortNum: string }>()
const bid = computed(() => Number(props.bid))
const sortNum = computed(() => Number(props.sortNum))
const chapter = ref<ChapterEditState>()
const isActive = computed(() => chapter.value?.BookId === bid.value && chapter.value?.SortNum === sortNum.value)
const { activeEditorMode } = useSettingStore()
const { saving, runEditorAction } = useEditorAction()

const request = useTimeoutFn(async () => {
  chapter.value = await getNovelEditInfo({ Bid: bid.value, SortNum: sortNum.value, Format: activeEditorMode })
})

async function save() {
  if (!chapter.value) return
  const currentChapter = chapter.value
  await runEditorAction({ content: currentChapter.Content ?? '', confirmWhenClean: true }, () =>
    updateNovelChapter({
      Cid: currentChapter.Id,
      Map: toRaw({ Title: currentChapter.Title, Content: currentChapter.Content ?? '' }),
    }),
  )
}

useInitRequest(request, { isActive })
</script>
