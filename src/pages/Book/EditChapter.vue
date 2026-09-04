<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div v-if="isActive">
      <div class="column gap-8">
        <q-input label="标题" v-model="chapter['Title']" />
        <div class="text-opacity">内容</div>
        <html-editor
          :content="chapter['Content']"
          content-type="novel-body"
          @update:html="chapter['Content'] = $event"
          mode="common"
        />
      </div>
    </div>

    <div v-else class="absolute-full">
      <q-inner-loading :showing="!isActive" label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <drag-page-sticky v-slot="{ isDragging }">
      <q-fab icon="mdiPlus" direction="up" color="accent" :disable="isDragging">
        <q-fab-action color="primary" @click="save" icon="mdiContentSave" :disable="isDragging">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            保存
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </drag-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed, ref, toRaw } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { useSettingStore } from '@/stores/setting'

import { HtmlEditor, DragPageSticky } from '@/components'
import { confirmEditorHtmlSave } from '@/components/html/editorSaveGuard'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { getNovelEditInfo, updateNovelChapter } from '@/services/chapter'

const props = defineProps<{ bid: string; sortNum: string }>()
const bid = computed(() => ~~props.bid)
const sortNum = computed(() => ~~props.sortNum)
const chapter = ref<any>()

const isActive = computed(() => chapter.value?.BookId === bid.value && chapter.value?.SortNum === sortNum.value)

const { activeEditorMode } = useSettingStore()

const request = useTimeoutFn(async () => {
  chapter.value = await getNovelEditInfo({ Bid: bid.value, SortNum: sortNum.value, Format: activeEditorMode })
})

const $q = useQuasar()

async function save() {
  if (!(await confirmEditorHtmlSave(chapter.value.Content, true))) return

  try {
    await updateNovelChapter({ Cid: chapter.value.Id, Map: toRaw(chapter.value) })

    $q.notify({
      type: 'positive',
      message: '修改成功',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e),
    })
  }
}

useInitRequest(request, { isActive: isActive })
</script>

<style scoped lang="scss"></style>
