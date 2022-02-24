<template>
  <div style="max-width: 1920px" class="mx-auto">
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

    <q-page-sticky position="bottom-right" :offset="fabPos">
      <q-fab
        :icon="icon.mdiPlus"
        direction="up"
        color="accent"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-fab-action color="primary" @click="save" :icon="icon.mdiContentSave" :disable="draggingFab">
          <q-tooltip transition-show="scale" transition-hide="scale" anchor="center left" self="center right">
            保存
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue'
import { icon } from '@/plugins/icon'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { getErrMsg } from '@/utils/getErrMsg'
import { useQuasar } from 'quasar'
import { getChapterEditInfo, editChapterContent } from '@/services/chapter'
import { HtmlEditor } from '@/components'

const props = defineProps<{ bid: string; sortNum: string }>()
const bid = computed(() => ~~props.bid)
const sortNum = computed(() => ~~props.sortNum)
const chapter = ref<any>()
const fabPos = ref([18, 18])
const draggingFab = ref(false)

const isActive = computed(() => chapter.value?.BookId === bid.value && chapter.value?.SortNum === sortNum.value)

const request = useTimeoutFn(async () => {
  chapter.value = await getChapterEditInfo({ BookId: bid.value, SortNum: sortNum.value })
})

function moveFab(ev) {
  draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
  fabPos.value = [fabPos.value[0] - ev.delta.x, fabPos.value[1] - ev.delta.y]
}

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
