<template>
  <div style="max-width: 80vw" class="mx-auto">
    <div style="display: flex; justify-content: flex-start">
      <n-cascader
        v-model:value="value"
        :options="options"
        :cascade="true"
        check-strategy="child"
        :show-path="true"
        :filterable="false"
        placeholder="排序方式"
        style="max-width: 150px"
      />
    </div>

    <n-grid :x-gap="12" :y-gap="8" responsive="screen" cols="3 s:4 m:5 l:6 xl:6 2xl:6" style="padding-top: 24px">
      <n-grid-item v-for="book in bookData" :key="book['Id']">
        <book-card :book="book"></book-card>
      </n-grid-item>
    </n-grid>

    <div style="display: flex; justify-content: center; padding-top: 24px">
      <n-pagination v-model:page="currentPage" :page-count="pageData.totalPage" />
    </div>
    <n-back-top />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import BookCard from '@/components/BookCard.vue'
import { useLoadingBar } from 'naive-ui'
import { getBookList } from '@/services/book'
import { BookInList } from '@/services/book/types'

export default defineComponent({
  components: {
    BookCard
  },
  name: 'BookList',
  props: {
    page: {
      type: [Number, String],
      default: 1
    }
  },
  computed: {
    currentPage: {
      get() {
        let _page = ~~this.page
        if (_page === 0) _page = 1
        return _page
      },
      set(val) {
        this.$router.push({ to: 'BookList', params: { page: val } })
      }
    }
  },
  setup() {
    const loadingBar = useLoadingBar()
    const bookData = ref<BookInList[]>([])

    return {
      hoverTrigger: ref(false),
      value: ref('last'),
      options: [
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
      ],
      bookData,
      pageData: ref({
        totalPage: 1
      }),
      request(page) {
        loadingBar.start()
        return getBookList(~~page)
          .then((serverData) => {
            this.bookData = serverData.Data
            this.pageData.totalPage = serverData.TotalPages
            console.log(serverData)
          })
          .finally(() => loadingBar.finish())
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.request(to.params.page).finally(() => next())
  },
  mounted() {
    this.request(this.currentPage)
  }
})
</script>

<style lang="scss" scoped></style>
