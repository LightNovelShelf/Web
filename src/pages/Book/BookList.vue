<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <q-select
      :disable="loading"
      emit-value
      map-options
      filled
      v-model="order"
      :options="options"
      label="排序"
      style="max-width: 200px; margin-left: auto"
    />

    <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
      <q-grid-item v-for="book in bookData" :key="book['Id']">
        <book-card :book="book"></book-card>
      </q-grid-item>
    </q-grid>

    <div class="pagination" style="display: flex; justify-content: center; padding-top: 24px">
      <q-pagination
        padding="4px"
        :disable="loading"
        v-model="currentPage"
        :max="pageData.totalPage"
        direction-links
        icon-first="mdiSkipPrevious"
        icon-last="mdiSkipNext"
        icon-prev="mdiChevronLeft"
        icon-next="mdiChevronRight"
        :max-pages="8"
        :input="!$q.screen.gt.sm"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref, computed, watch, defineComponent } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'

import { useSettingStore } from 'stores/setting'

import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { NOOP } from 'src/const/empty'
import { getBookList } from 'src/services/book'

import type { BookInList } from 'src/services/book/types'

defineComponent({ QGrid, QGridItem })
const props = defineProps<{ page: string; order: 'new' | 'view' | 'latest' }>()

const options = [
  {
    label: '最近更新',
    value: 'latest',
  },
  {
    label: '上架时间',
    value: 'new',
  },
  {
    label: '总点击量',
    value: 'view',
  },
]

const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })

const currentPage = computed({
  get() {
    return ~~props.page || 1
  },
  set(val: number) {
    router.push({ name: 'BookList', params: { page: val } })
  },
})
const order = computed({
  get() {
    return props.order
  },
  set(val: string) {
    router.push({ name: 'BookList', params: { page: 1, order: val } })
  },
})

const settingStore = useSettingStore()
const { generalSetting } = settingStore
const request = useTimeoutFn(function (page = currentPage.value, order = props.order) {
  return getBookList({
    Page: page,
    Order: order,
    Size: 24,
    IgnoreJapanese: generalSetting.ignoreJapanese,
    IgnoreAI: generalSetting.ignoreAI,
  }).then((serverData) => {
    bookData.value = serverData.Data
    pageData.value.totalPage = serverData.TotalPages
  })
})

const loading = request.loading

watch(request.loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) {
    $q.loadingBar.start()
  }
})

onBeforeRouteUpdate((to, from, next) => {
  request(~~to.params.page || 1, `${to.params.order}`).then(() => next(), NOOP)
})

useInitRequest(request)
</script>

<style lang="scss" scoped>
.pagination {
  :deep(.q-btn) {
    min-width: 34px !important;
  }
}
</style>
