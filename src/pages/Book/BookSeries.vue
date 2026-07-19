<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div class="top-bar">
      <q-select
        :disable="loading"
        emit-value
        map-options
        filled
        dense
        :model-value="'series'"
        :options="viewOptions"
        label="展示方式"
        style="width: 160px"
        @update:model-value="onViewChange"
      />
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
      <q-grid-item v-for="series in seriesData" :key="series.Name">
        <folder-card
          :title="series.Name"
          :covers="[series.Cover]"
          :count="series.Count"
          :updated-at="series.LastUpdatedAt"
          :to="{ name: 'BookSeriesBooks', params: { name: series.Name, order: props.order, page: 1 } }"
        />
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

import FolderCard from 'components/FolderCard.vue'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { NOOP } from 'src/const/empty'
import { getSeriesList } from 'src/services/book'

import type { SeriesInList } from 'src/services/book/types'

defineComponent({ QGrid, QGridItem })
const props = defineProps<{ page: string; order: 'new' | 'view' | 'latest' }>()

const options = [
  { label: '最近更新', value: 'latest' },
  { label: '上架时间', value: 'new' },
  { label: '总点击量', value: 'view' },
]
const viewOptions = [
  { label: '平铺', value: 'flat' },
  { label: '按系列', value: 'series' },
]

const router = useRouter()
const $q = useQuasar()
const seriesData = ref<SeriesInList[]>([])
const pageData = ref({ totalPage: 1 })

const currentPage = computed({
  get() {
    return ~~props.page || 1
  },
  set(val: number) {
    router.push({ name: 'BookSeries', params: { order: props.order, page: val } })
  },
})
const order = computed({
  get() {
    return props.order
  },
  set(val: string) {
    router.push({ name: 'BookSeries', params: { order: val, page: 1 } })
  },
})

/** 切回平铺视图 */
function onViewChange(val: string) {
  if (val === 'flat') {
    router.push({ name: 'BookList', params: { order: props.order, page: 1 } })
  }
}

const settingStore = useSettingStore()
const { generalSetting } = settingStore
const request = useTimeoutFn(function (page = currentPage.value, order = props.order) {
  return getSeriesList({
    Page: page,
    Order: order,
    Size: 24,
    IgnoreJapanese: generalSetting.ignoreJapanese,
    IgnoreAI: generalSetting.ignoreAI,
  }).then((res) => {
    seriesData.value = res.Data
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
  request(~~to.params.page || 1, `${to.params.order}`).then(() => next(), NOOP)
})

useInitRequest(request)
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
