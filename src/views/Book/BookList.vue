<template>
  <div style="max-width: 1920px" class="mx-auto">
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

    <div style="display: flex; justify-content: center; padding-top: 24px">
      <q-pagination
        :disable="loading"
        v-model="currentPage"
        :max="pageData.totalPage"
        direction-links
        boundary-links
        :icon-first="icon.mdiSkipPrevious"
        :icon-last="icon.mdiSkipNext"
        :icon-prev="icon.mdiChevronLeft"
        :icon-next="icon.mdiChevronRight"
        :max-pages="6"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineComponent } from 'vue'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import { useQuasar } from 'quasar'
import { icon } from '@/plugins/icon'
import { getBookList } from '@/services/book'
import { BookInList } from '@/services/book/types'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import { useTimeoutFn } from '@/composition/useTimeoutFn'
import { NOOP } from '@/const/empty'
import { useInitRequest } from '@/composition/biz/useInitRequest'

defineComponent({ QGrid, QGridItem })
const props = defineProps<{ page: string; order: string }>()

const options = [
  {
    label: '最近更新',
    value: 'latest'
  },
  {
    label: '上架时间',
    value: 'new'
  },
  {
    label: '总点击量',
    value: 'view',
    children: [
      {
        label: '日榜',
        value: 'daily'
      },
      {
        label: '周榜',
        value: 'weekly'
      },
      {
        label: '月榜',
        value: 'Monthly'
      },
      {
        label: '总榜',
        value: 'all'
      }
    ]
  }
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
  }
})
const order = computed({
  get() {
    return props.order
  },
  set(val: string) {
    router.push({ name: 'BookList', params: { page: 1, order: val } })
  }
})

const request = useTimeoutFn(function (page: number = currentPage.value, order: string = props.order) {
  return getBookList({ Page: page, Order: order, Size: 24 }).then((serverData) => {
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

/** 已经有数据（不是mounted场景）时延时请求 */
useInitRequest(request)
</script>

<style lang="scss" scoped></style>
