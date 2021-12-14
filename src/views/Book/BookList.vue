<template>
  <div style="max-width: 1920px" class="mx-auto">
    <QGrid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
      <QGridItem v-for="book in bookData" :key="book['Id']">
        <book-card :book="book"></book-card>
      </QGridItem>
    </QGrid>

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
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onActivated, watch, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import { useQuasar } from 'quasar'
import { icon } from '@/plugins/icon'
import { getBookList } from '@/services/book'
import { BookInList } from '@/services/book/types'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import { useTimeout } from '@/composition/useTimeout'
import { NOOP } from '@/const/empty'

const options = [
  {
    label: '上架时间',
    value: 'last'
  },
  {
    label: '最近更新',
    value: 'new'
  },
  {
    label: '人气值',
    value: 'rank',
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

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })

const currentPage = computed({
  get() {
    return ~~route.params.page || 1
  },
  set(val: number) {
    router.push({ name: 'BookList', params: { page: val } })
  }
})

const requesting = ref(false)

const request = useTimeout(function (page: number = currentPage.value) {
  requesting.value = true

  return getBookList({ Page: page })
    .then((serverData) => {
      bookData.value = serverData.Data
      pageData.value.totalPage = serverData.TotalPages
      console.log('serverData: ', serverData)
    })
    .finally(() => {
      requesting.value = false
    })
})

const loading = computed(() => requesting.value || request.scheduled.value)

watch(loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) {
    $q.loadingBar.start()
  }
})

onBeforeRouteUpdate((to, from, next) => {
  request(~~to.params.page || 1).then(() => next(), NOOP)
})

/** 已经有数据（不是mounted场景）时延时请求 */
onMounted(() => {
  bookData.value.length ? request() : request.syncCall()
})
</script>

<style lang="scss" scoped></style>
