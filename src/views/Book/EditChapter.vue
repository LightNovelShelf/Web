<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <div v-if="isActive">
      <div class="q-gutter-sm">
        <q-input label="标题" v-model="chapter['Title']" />
        <div class="text-opacity">内容</div>
        <html-editor v-model:html="chapter['Content']" mode="common" />
      </div>
    </div>

    <div v-else class="absolute-full">
      <q-inner-loading :showing="!isActive" label="加载中..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>

    <drag-page-sticky v-slot="{ isDragging }">
      <q-fab :icon="icon.mdiPlus" direction="up" color="accent" :disable="isDragging">
        <q-fab-action color="primary" @click="save" :icon="icon.mdiContentSave" :disable="isDragging">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            保存
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </drag-page-sticky>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue'
import { icon } from 'assets/icon'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { getErrMsg } from 'src/utils/getErrMsg'
import { useQuasar } from 'quasar'
import { getChapterEditInfo, editChapterContent } from 'src/services/chapter'
import { HtmlEditor } from 'src/components'
import DragPageSticky from 'components/DragPageSticky.vue'

const props = defineProps<{ bid: string; sortNum: string }>()
const bid = computed(() => ~~props.bid)
const sortNum = computed(() => ~~props.sortNum)
const chapter = ref<any>()

const isActive = computed(() => chapter.value?.BookId === bid.value && chapter.value?.SortNum === sortNum.value)

const request = useTimeoutFn(async () => {
  chapter.value = await getChapterEditInfo({ BookId: bid.value, SortNum: sortNum.value })
})

const $q = useQuasar()

async function save() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await editChapterContent(toRaw(chapter.value))

      $q.notify({
        type: 'positive',
        message: '修改成功'
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e)
      })
    }
  })
}

useInitRequest(request, { isActive: isActive })
</script>

<style scoped lang="scss"></style>
