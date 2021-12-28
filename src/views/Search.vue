<template>
  <!-- todo 不懂他为什么不能放在q-tab-panel里面 -->
  <q-infinite-scroll @load="requestBook" :offset="100" ref="scroll">
    <div class="q-gutter-y-md">
      <div class="row flex-center">
        <q-input rounded outlined dense v-model="searchKey" @keyup.enter="search" />
      </div>
      <div class="q-gutter-y-md">
        <q-tabs dense v-model="tab" class="text-teal">
          <template v-for="option in tabOptions" :key="option.key">
            <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
          </template>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="Book">
            <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
              <q-grid-item v-for="book in bookData" :key="book['Id']">
                <book-card :book="book"></book-card>
              </q-grid-item>
            </q-grid>
          </q-tab-panel>

          <q-tab-panel name="Form">
            <div class="q-pa-md">
              <div>Form</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </template>
  </q-infinite-scroll>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, reactive, watch } from 'vue'
import { getBookList } from '@/services/book'
import { icon } from '@/plugins/icon'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard'
import { BookInList } from '@/services/book/types'
import { useRouter } from 'vue-router'

defineComponent({ QGrid, QGridItem, BookCard })
const props = defineProps<{ keyWords: string }>()
const router = useRouter()
const scroll = ref()
const searchKey = ref(props.keyWords)
const requestBook = async (index, done) => {
  let res = await getBookList({ Page: index, Size: 24, KeyWords: props.keyWords })
  bookData.push(...res.Data)
  if (res.TotalPages === index || res.TotalPages === 0) scroll.value.stop()
  else done()
}
function search() {
  router.push({ name: 'Search', params: { keyWords: searchKey.value } })
}
watch(
  () => props.keyWords,
  () => {
    searchKey.value = props.keyWords
    scroll.value.reset()
    scroll.value.resume()
    scroll.value.poll()
    bookData.length = 0
  }
)
const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Book',
    key: 'Book',
    label: '小说',
    icon: icon.mdiBook,
    disable: false
  },
  {
    name: 'Form',
    key: 'Form',
    label: '社区',
    icon: icon.mdiForum,
    disable: true
  },
  {
    name: 'User',
    key: 'User',
    label: '用户',
    icon: icon.mdiAccount,
    disable: true
  }
]
const tab = ref('Book')
const bookData = reactive<BookInList[]>([])
</script>

<style scoped lang="scss"></style>
