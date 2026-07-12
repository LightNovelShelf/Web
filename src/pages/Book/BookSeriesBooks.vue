<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div class="top-bar">
      <q-btn flat dense no-caps icon="mdiChevronLeft" label="返回系列" @click="backToSeries" />
      <div class="series-title" :title="props.name">{{ props.name }}</div>
      <q-space />
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

import { useSettingStore } from 'stores/setting'

import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { NOOP } from 'src/const/empty'
import { getBooksBySeries } from 'src/services/book'

import type { BookInList } from 'src/services/book/types'

defineComponent({ QGrid, QGridItem })
const props = defineProps<{ name: string; page: string; order: 'new' | 'view' | 'latest' }>()

const options = [
  { label: '最近更新', value: 'latest' },
  { label: '上架时间', value: 'new' },
  { label: '总点击量', value: 'view' },
]

const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })

const currentPage = computed({
  get() {
    return ~~props.page || 1
  },
  // 用 replace 而非 push：drill-in 内翻页不污染历史，保证 back 始终指向系列网格
  set(val: number) {
    router.replace({ name: 'BookSeriesBooks', params: { name: props.name, order: props.order, page: val } })
  },
})
const order = computed({
  get() {
    return props.order
  },
  set(val: string) {
    router.replace({ name: 'BookSeriesBooks', params: { name: props.name, order: val, page: 1 } })
  },
})

/** 返回系列网格：上一条历史就是系列网格时直接后退（keep-alive 不刷新），否则 push */
function backToSeries() {
  const back = window.history.state?.back
  if (typeof back === 'string' && back.includes('/book/series/')) {
    router.go(-1)
  } else {
    router.push({ name: 'BookSeries', params: { order: props.order, page: 1 } })
  }
}

const settingStore = useSettingStore()
const { generalSetting } = settingStore
const request = useTimeoutFn(function (name = props.name, page = currentPage.value, order = props.order) {
  bookData.value = []
  pageData.value.totalPage = 1
  return getBooksBySeries({
    SeriesName: name,
    Page: page,
    Order: order,
    Size: 24,
    IgnoreJapanese: generalSetting.ignoreJapanese,
    IgnoreAI: generalSetting.ignoreAI,
  }).then((res) => {
    bookData.value = res.Data
    pageData.value.totalPage = res.TotalPages
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
  request(`${to.params.name}`, ~~to.params.page || 1, `${to.params.order}`).then(() => next(), NOOP)
})

useInitRequest(request)
</script>

<style lang="scss" scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.series-title {
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 50%;
}

.pagination {
  :deep(.q-btn) {
    min-width: 34px !important;
  }
}
</style>
