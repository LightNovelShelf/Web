<template>
  <q-page padding style="max-width: 1920px" class="q-mx-auto">
    <div class="top-bar">
      <q-select
        :disable="loading || categoryLoading"
        emit-value
        map-options
        filled
        dense
        v-model="category"
        :options="categoryOptions"
        label="小说类型"
        style="width: 160px"
      />
      <q-space />
      <q-select
        :disable="loading"
        emit-value
        map-options
        filled
        dense
        v-model="view"
        :options="viewOptions"
        label="展示方式"
        style="width: 160px"
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

    <paged-list :list="list" :item-key="itemKey">
      <template #item="{ item }">
        <folder-card
          v-if="isSeries(item)"
          :title="item.Name"
          :covers="[item.Cover]"
          :count="item.Count"
          :updated-at="item.LastUpdatedAt"
          :to="{ name: 'BookSeriesBooks', params: { name: item.Name, order: order, page: 1 } }"
        />
        <book-card v-else :book="item" />
      </template>
    </paged-list>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { useSettingStore } from '@/stores/setting'

import BookCard from '@/components/BookCard.vue'
import FolderCard from '@/components/FolderCard.vue'
import PagedList from '@/components/list/PagedList.vue'

import { useInitRequest } from '@/composition/biz/useInitRequest'
import { usePagedList } from '@/composition/biz/usePagedList'
import { nullableNumberQuery, stringQuery, useQueryState } from '@/composition/biz/useQueryState'
import { useLoadingFn } from '@/composition/useFnLoading'

import { getBookCategories, getBookList, getSeriesList } from '@/services/book'

import type { BookInList, SeriesInList } from '@/services/book/types'

type ListItem = BookInList | SeriesInList

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

const view = useQueryState('view', stringQuery('flat', ['flat', 'series'] as const))
const order = useQueryState('order', stringQuery('latest', ['latest', 'new', 'view'] as const))
const category = useQueryState('category', nullableNumberQuery())

const categoryOptions = ref<Array<{ label: string; value: number | null }>>([{ label: '全部类型', value: null }])

const { generalSetting } = useSettingStore()

const list = usePagedList<ListItem>({
  async fetch(page) {
    const params = {
      Page: page,
      Order: order.value,
      Size: 24,
      IgnoreJapanese: generalSetting.ignoreJapanese,
      IgnoreAI: generalSetting.ignoreAI,
      CategoryId: category.value ?? undefined,
    }
    const res = view.value === 'series' ? await getSeriesList(params) : await getBookList(params)

    return { data: res.Data, totalPages: res.TotalPages }
  },
  deps: () => [view.value, order.value, category.value],
})
const loading = list.loading

/** 系列项没有 Id，用 Name 区分 */
function isSeries(item: ListItem): item is SeriesInList {
  return 'Name' in item
}

function itemKey(item: ListItem) {
  return isSeries(item) ? item.Name : item.Id
}

const categoryRequest = useLoadingFn(() =>
  getBookCategories('Novel').then((categories) => {
    categoryOptions.value = [
      { label: '全部类型', value: null },
      ...categories.map((category) => ({ label: category.Name, value: category.Id })),
    ]
  }),
)
const categoryLoading = categoryRequest.loading

useInitRequest(categoryRequest)
</script>

<style lang="scss" scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
