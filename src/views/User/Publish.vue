<template>
  <q-page padding style="max-width: 1920px" class="mx-auto">
    <div class="q-gutter-y-md">
      <q-tabs dense v-model="tab" class="text-teal">
        <template v-for="option in tabOptions" :key="option.key">
          <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
        </template>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="Book">
          <div class="text-right">
            <q-btn color="primary"> 发布新书 </q-btn>
          </div>

          <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
            <q-grid-item v-for="book in bookData" :key="book['Id']">
              <div class="q-gutter-sm">
                <book-card :book="book"></book-card>
                <div>
                  <div class="flex q-gutter-sm">
                    <q-btn dense color="negative" class="flex-space">删除</q-btn>
                    <q-btn dense color="primary" class="flex-space">管理</q-btn>
                  </div>
                </div>
              </div>
            </q-grid-item>
          </q-grid>

          <div class="pagination" style="display: flex; justify-content: center; padding-top: 24px">
            <q-pagination
              padding="4px"
              :disable="loading"
              v-model="currentPage"
              :max="pageData.totalPage"
              direction-links
              :icon-first="icon.mdiSkipPrevious"
              :icon-last="icon.mdiSkipNext"
              :icon-prev="icon.mdiChevronLeft"
              :icon-next="icon.mdiChevronRight"
              :max-pages="8"
              :input="!$q.screen.gt.sm"
            />
          </div>
        </q-tab-panel>

        <q-tab-panel name="Form">
          <div class="q-pa-md">
            <div>Form</div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from 'src/components/BookCard.vue'
import { useQuasar } from 'quasar'
import { icon } from 'assets/icon'
import { getMyBooks } from 'src/services/user'
import { BookInList } from 'src/services/book/types'
import { QGrid, QGridItem } from 'src/components/grid'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'
import { useInitRequest } from 'src/composition/biz/useInitRequest'

defineComponent({ QGrid, QGridItem })

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Book',
    key: 'Book',
    label: '书籍',
    icon: icon.mdiBook,
    disable: false
  },
  {
    name: 'Form',
    key: 'Form',
    label: '社区',
    icon: icon.mdiForum,
    disable: true
  }
]

const tab = ref('Book')
const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })
const _page = ref(1)

const currentPage = computed({
  get() {
    return _page.value
  },
  set(val) {
    request(val)
  }
})

const request = useTimeoutFn(function (page = currentPage.value) {
  return getMyBooks({ Page: page, Size: 24 }).then((serverData) => {
    bookData.value = serverData.Data
    pageData.value.totalPage = serverData.TotalPages
    _page.value = serverData.Page
  })
})

const loading = request.loading

watch(request.loading, (nextLoading) => {
  $q.loadingBar.stop()
  if (nextLoading) {
    $q.loadingBar.start()
  }
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
