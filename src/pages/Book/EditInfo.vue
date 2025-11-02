<template>
  <q-page padding style="max-width: 1920px" class="flex-align-center flex fit">
    <q-grid v-if="isActive" x-gap="24" y-gap="6" cols="3" xs="1" sm="2" md="2">
      <q-grid-item>
        <div class="q-gutter-sm">
          <div class="text-opacity">封面预览</div>
          <q-card>
            <q-img v-if="book?.Cover" :src="book['Cover']" :ratio="2 / 3">
              <template v-if="book?.Placeholder && generalSetting.enableBlurHash" v-slot:loading>
                <blur-hash :blurhash="book.Placeholder" />
              </template>
            </q-img>
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

import { getErrMsg } from 'src/utils/getErrMsg'

import { useSettingStore } from 'stores/setting'

import { HtmlEditor, BlurHash, DragPageSticky } from 'components'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { getBookEditInfo, editBook } from 'src/services/book'

const props = defineProps<{ bid: string }>()
const bid = computed(() => ~~props.bid)
const book = ref<any>()
const options = ref([])
const isActive = computed(() => book.value?.Id === bid.value)

const settingStore = useSettingStore()
const { generalSetting } = settingStore

const request = useTimeoutFn(async () => {
  const data = (await getBookEditInfo(bid.value)) as any
  options.value = data.Categories.map((item) => {
    return {
      label: item.Name,
      value: item.Id,
    }
  })
  book.value = data.Book
})

const $q = useQuasar()

async function save() {
  $q.dialog({
    title: '提示',
    message: '你确定要保存吗？',
    cancel: true,
  }).onOk(async () => {
    try {
      await editBook(bid.value, toRaw(book.value))

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
  })
}

useInitRequest(request, { isActive: isActive })
</script>

<style scoped lang="scss"></style>
