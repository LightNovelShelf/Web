<template>
  <div>
    <q-infinite-scroll
      :ref="(el) => el && (list.scrollRef.value = el as QInfiniteScroll)"
      :disable="list.paging.value"
      :offset="100"
      @load="list.onLoad"
    >
      <q-grid
        v-if="list.items.value.length"
        :x-gap="12"
        :y-gap="8"
        cols="6"
        xs="3"
        sm="4"
        md="5"
        lg="6"
        xl="6"
        style="margin-top: 12px"
      >
        <q-grid-item v-for="(item, index) in list.items.value" :key="keyOf(item, index)">
          <slot name="item" :item="item" :index="index" />
        </q-grid-item>
      </q-grid>
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <div v-if="list.error.value && !list.items.value.length" class="empty column items-center gap-8 text-grey-7">
      <div>{{ getErrMsg(list.error.value) }}</div>
      <q-btn dense flat color="primary" :disable="list.loading.value" @click="list.reload">重试</q-btn>
    </div>
    <div v-else-if="!list.items.value.length && !list.loading.value" class="empty text-grey-7">
      <slot name="empty">暂无内容</slot>
    </div>

    <div v-if="list.paging.value && list.items.value.length" class="pagination">
      <q-pagination
        padding="4px"
        :disable="list.loading.value"
        v-model="page"
        :max="list.totalPage.value"
        direction-links
        icon-first="mdiSkipPrevious"
        icon-last="mdiSkipNext"
        icon-prev="mdiChevronLeft"
        icon-next="mdiChevronRight"
        :max-pages="8"
        :input="!$q.screen.gt.sm"
      />
    </div>
  </div>
</template>

<script lang="ts" setup generic="T">
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import { getErrMsg } from '@/utils/getErrMsg'

import { QGrid, QGridItem } from '@/components/grid'

import type { PagedList } from '@/composition/biz/usePagedList'
import type { QInfiniteScroll } from 'quasar'

const props = defineProps<{
  list: PagedList<T>
  /** 列表项的 key，默认取下标 */
  itemKey?: (item: T) => string | number
}>()

const $q = useQuasar()

const page = computed({
  get: () => props.list.currentPage.value,
  set: (value: number) => void (props.list.currentPage.value = value),
})

function keyOf(item: T, index: number) {
  return props.itemKey ? props.itemKey(item) : index
}
</script>

<style lang="scss" scoped>
.empty {
  display: flex;
  min-height: 240px;
  align-items: center;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center;
  padding-top: 24px;

  :deep(.q-btn) {
    min-width: 34px !important;
  }
}
</style>
