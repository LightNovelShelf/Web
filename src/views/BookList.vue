<template>
  <div style="max-width: 1920px" class="mx-auto">
    <QGrid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
      <QGridItem v-for="book in bookData" :key="book['Id']">
        <book-card :book="book"></book-card>
      </QGridItem>
    </QGrid>

    <div style="display: flex; justify-content: center; padding-top: 24px">
      <q-pagination
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
import { ref, computed, onActivated, withDefaults } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import { useQuasar } from 'quasar'
import { icon } from '@/plugins/icon'
import { getBookList } from '@/services/book'
import { BookInList } from '@/services/book/types'
import { QGrid, QGridItem } from '@/plugins/quasar/components'

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

const props = withDefaults(
  defineProps<{
    page?: number | string
  }>(),
  {
    page: 1
  }
)

const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({
  totalPage: 1
})
const currentPage = computed({
  get() {
    let _page = ~~props.page
    if (_page === 0) _page = 1
    return _page
  },
  set(val: number) {
    router.push({ name: 'BookList', params: { page: val } })
  }
})

function request(page) {
  let _page = ~~page
  if (_page === 0) _page = 1
  $q.loadingBar.start()
  return getBookList({ Page: _page })
    .then((serverData) => {
      bookData.value = serverData.Data
      pageData.value.totalPage = serverData.TotalPages
      console.log(serverData)
    })
    .finally(() => $q.loadingBar.stop())
}

const getList = () => request(currentPage.value)

onBeforeRouteUpdate((to, from, next) => {
  request(to.params.page).finally(() => next())
})

onActivated(getList)
</script>

<style lang="scss" scoped></style>
