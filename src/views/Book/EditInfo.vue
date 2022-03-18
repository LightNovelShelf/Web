<template>
  <div style="max-width: 1920px" class="flex-align-center flex fit">
    <q-grid v-if="isActive" x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
      <q-grid-item>
        <div class="q-gutter-sm">
          <div class="text-opacity">封面预览</div>
          <q-card>
            <q-img v-if="book?.Cover" :src="book['Cover']" :ratio="2 / 3" />
            <q-responsive v-else :ratio="2 / 3">
              <q-skeleton class="fit" square />
            </q-responsive>
          </q-card>
        </div>
      </q-grid-item>
      <q-grid-item span="2" xs="1" sm="1" md="1">
        <div class="q-gutter-sm">
          <q-input label="封面地址" placeholder="https://" v-model="book['Cover']" />
          <q-input label="书名" v-model="book['Title']" />
          <q-input label="作者" v-model="book['Author']" />
          <div class="text-opacity">简介</div>
          <html-editor v-model:html="book['Introduction']" mode="simple" />
          <q-select map-options emit-value v-model="book['CategoryId']" :options="options" label="分类" />
        </div>
      </q-grid-item>
    </q-grid>

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
import { icon } from 'assets/icon'
import { QGrid, QGridItem } from 'src/components/grid'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { getBookEditInfo, editBook } from 'src/services/book'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { getErrMsg } from 'src/utils/getErrMsg'
import { useQuasar } from 'quasar'
import { HtmlEditor } from 'src/components'

const props = defineProps<{ bid: string }>()
const bid = computed(() => ~~props.bid)
const book = ref<any>()
const fabPos = ref([18, 18])
const draggingFab = ref(false)
const options = ref([])
const isActive = computed(() => book.value?.Id === bid.value)

const request = useTimeoutFn(async () => {
  const data = (await getBookEditInfo(bid.value)) as any
  options.value = data.Categories.map((item) => {
    return {
      label: item.Name,
      value: item.Id
    }
  })
  book.value = data.Book
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
      await editBook(toRaw(book.value))

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
