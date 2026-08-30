<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div class="top-bar">
      <q-select
        :disable="loading || categoryLoading"
        emit-value
        map-options
        filled
        dense
        :model-value="categoryId"
        :options="categoryOptions"
        label="小说类型"
        style="width: 160px"
        @update:model-value="onCategoryChange"
      />
      <q-space />
      <q-select
        :disable="loading"
        emit-value
        map-options
        filled
        dense
        :model-value="'flat'"
        :options="viewOptions"
        label="展示方式"
        style="width: 160px"
        @update:model-value="onViewChange"
      />
      <q-select
        :disable="loading"
        emit-value
        map-options
        filled
        dense
        v-model="order"
        :options="options"
        label="排序"
        style="width: 160px"
      />
    </div>

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

import { useSettingStore } from '@/stores/setting'

import BookCard from '@/components/BookCard.vue'
import { QGrid, QGridItem } from '@/components/grid'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

import { NOOP } from '@/const/empty'
import { getBookCategories, getBookList } from '@/services/book'

import type { BookInList } from '@/services/book/types'

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
const viewOptions = [
  { label: '平铺', value: 'flat' },
  { label: '按系列', value: 'series' },
]

const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })
const categoryId = ref<number | null>(null)
const categoryOptions = ref<Array<{ label: string; value: number | null }>>([{ label: '全部类型', value: null }])

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

function onViewChange(value: string) {
  if (value === 'series') {
    router.push({ name: 'BookSeries', params: { order: props.order, page: 1 } })
  }
}

function onCategoryChange(value: number | null) {
  categoryId.value = value
  if (currentPage.value === 1) {
    request(1, props.order, value).catch(NOOP)
    return
  }

  router.push({ name: 'BookList', params: { page: 1, order: props.order } })
}

const settingStore = useSettingStore()
const { generalSetting } = settingStore
const request = useTimeoutFn(function (
  page = currentPage.value,
  order = props.order,
  selectedCategoryId = categoryId.value,
) {
  return getBookList({
    Page: page,
    Order: order,
    Size: 24,
    IgnoreJapanese: generalSetting.ignoreJapanese,
    IgnoreAI: generalSetting.ignoreAI,
    CategoryId: selectedCategoryId ?? undefined,
  }).then((serverData) => {
    bookData.value = serverData.Data
    pageData.value.totalPage = serverData.TotalPages
  })
})

const categoryRequest = useTimeoutFn(() =>
  getBookCategories('Novel').then((categories) => {
    categoryOptions.value = [
      { label: '全部类型', value: null },
      ...categories.map((category) => ({ label: category.Name, value: category.Id })),
    ]
  }),
)
const categoryLoading = categoryRequest.loading

const loading = request.loading

watch(request.loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) {
    $q.loadingBar.start()
  }
})

onBeforeRouteUpdate(async (to) => {
  await request(~~to.params.page || 1, `${to.params.order}`, categoryId.value).catch(NOOP)
})

useInitRequest(request)
useInitRequest(categoryRequest)
</script>

<style lang="scss" scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination {
  :deep(.q-btn) {
    min-width: 34px !important;
  }
}
</style>
