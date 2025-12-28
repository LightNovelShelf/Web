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
          <div class="flex justify-between items-center gap-8">
            <q-input
              dense
              outlined
              v-model="searchKeyword"
              placeholder="搜索书籍"
              @keyup.enter="searchBook"
              style="width: 250px"
            >
              <template v-slot:append>
                <q-icon name="mdiMagnify" class="cursor-pointer" @click="searchBook" />
              </template>
            </q-input>
            <div class="q-gutter-x-sm">
              <q-btn color="primary" @click="uploadBookShow = true"> 上传书籍 </q-btn>
              <q-btn color="primary" @click="createBookShow = true"> 发布新书 </q-btn>
            </div>
          </div>

          <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
            <q-grid-item v-for="(book, index) in bookData" :key="book['Id']">
              <div class="q-gutter-sm">
                <book-card :book="book"></book-card>
                <div>
                  <div class="flex q-gutter-sm">
                    <q-btn dense color="negative" class="flex-space" @click="delBook(book['Id'], index)">删除</q-btn>
                    <q-btn
                      dense
                      color="primary"
                      class="flex-space"
                      :to="{ name: 'UserBookEditor', params: { bookId: book['Id'] } }"
                    >
                      管理
                    </q-btn>
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
              icon-first="mdiSkipPrevious"
              icon-last="mdiSkipNext"
              icon-prev="mdiChevronLeft"
              icon-next="mdiChevronRight"
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

    <q-dialog v-model="createBookShow">
      <q-card class="create-book-dialog">
        <q-card-section>
          <div class="text-h6">创建书籍</div>
        </q-card-section>

        <q-form @submit="createBook">
          <q-card-section style="padding-top: 0">
            <div class="q-gutter-sm">
              <image-input
                label="封面链接"
                :rules="[(val) => val.startsWith('https://') || '必须是一个https链接']"
                v-model="createBookData.Cover"
              />
              <q-input label="标题" :rules="[(val) => !!val || '必填项目']" v-model="createBookData.Title" />
              <q-input label="作者" :rules="[(val) => !!val || '必填项目']" v-model="createBookData.Author" />
              <q-input
                label="简介"
                :rules="[(val) => !!val || '必填项目']"
                type="textarea"
                v-model="createBookData.Introduction"
              />
              <q-input label="章节数量(请预估所需要的章节数量)" type="number" v-model="createBookData.Count" />
              <q-select
                map-options
                emit-value
                v-model="createBookData.CategoryId"
                :options="categoryOptions"
                label="分类"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn type="submit" flat label="创建" color="primary" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="uploadBookShow">
      <q-uploader
        :factory="factoryFn"
        :filter="checkFile"
        label="上传列表(.epub)"
        multiple
        batch
        style="max-width: 500px"
      />
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { ref, computed, watch, defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'

import { getErrMsg } from 'src/utils/getErrMsg'

import { ImageInput } from 'components'
import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'components/grid'

import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

import { deleteBook } from 'src/services/book'
import { PATH } from 'src/services/path'
import { getMyBooks, quickCreateNovel } from 'src/services/user'
import { getSessionToken } from 'src/services/utils'

import type { QUploaderFactoryFn } from 'quasar'
import type { BookInList } from 'src/services/book/types'
import type { QuickCreateNovel } from 'src/services/user/type'

defineComponent({ QGrid, QGridItem })

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Book',
    key: 'Book',
    label: '书籍',
    icon: 'mdiBook',
    disable: false,
  },
  {
    name: 'Form',
    key: 'Form',
    label: '社区',
    icon: 'mdiForum',
    disable: true,
  },
]

const tab = ref('Book')
const router = useRouter()
const $q = useQuasar()
const bookData = ref<BookInList[]>([])
const pageData = ref({ totalPage: 1 })
const _page = ref(1)
const createBookShow = ref(false)
const uploadBookShow = ref(false)
const searchKeyword = ref('')
const categoryOptions = ref([
  {
    label: '录入完成',
    value: 1,
  },
  {
    label: '翻译完成',
    value: 2,
  },
  {
    label: '录入中',
    value: 4,
  },
  {
    label: '翻译中',
    value: 3,
  },
  {
    label: '转载',
    value: 5,
  },
  {
    label: '日文原版',
    value: 6,
  },
  {
    label: '原创',
    value: 7,
  },
  {
    label: 'AI翻译',
    value: 8,
  },
])
const createBookData = reactive<QuickCreateNovel.Request>({
  Cover: '',
  Title: '',
  Count: 5,
  Author: '',
  Introduction: '',
  CategoryId: 1,
})

const currentPage = computed({
  get() {
    return _page.value
  },
  set(val) {
    request(val)
  },
})

const request = useTimeoutFn(function (page = currentPage.value) {
  return getMyBooks({ Page: page, Size: 24, KeyWords: searchKeyword.value }).then((serverData) => {
    bookData.value = serverData.Data
    pageData.value.totalPage = serverData.TotalPages
    _page.value = serverData.Page
  })
})

function searchBook() {
  _page.value = 1
  request(1)
}

function delBook(bid: number, index: number) {
  $q.dialog({
    title: '提示',
    message: '你确定要删除吗？',
    cancel: true,
  }).onOk(async () => {
    try {
      await deleteBook(bid)

      $q.notify({
        type: 'positive',
        message: '删除成功',
      })
      bookData.value.splice(index, 1)
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: getErrMsg(e),
      })
    }
  })
}
async function createBook() {
  try {
    const request = {
      ...createBookData,
      Count: ~~createBookData.Count,
      Introduction: createBookData.Introduction.replace(/^([\s\S]*?)$/gm, '<p>$1</p>'),
    }
    const bid = await quickCreateNovel(request)
    $q.notify({
      type: 'positive',
      message: '创建成功',
    })
    createBookShow.value = false
    await router.push({ name: 'BookInfo', params: { bid } })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: getErrMsg(e),
    })
    throw e
  }
}

function checkFile(files: File[]) {
  return files.filter((file) => file.name.endsWith('.epub'))
}
const factoryFn: QUploaderFactoryFn = (files) => {
  return new Promise((resolve, reject) => {
    getSessionToken().then((token) => {
      resolve({
        url: PATH.USER_UPLOAD_BOOK,
        method: 'POST',
        headers: [{ name: 'Authorization', value: `Bearer ${token}` }],
      })
    })
  })
}

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
.create-book-dialog {
  width: 500px;
  max-width: 90vw;
}
</style>
