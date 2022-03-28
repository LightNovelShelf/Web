<template>
  <q-page padding>
    <!-- 滚动加载 -->
    <q-infinite-scroll @load="onLoad" :offset="100" ref="scroll" :disable="history.length === 0">
      <div class="q-gutter-y-md">
        <q-tabs dense v-model="tab" class="text-teal">
          <template v-for="option in tabOptions" :key="option.key">
            <q-tab :name="option.name" :icon="option.icon" :label="option.label" :disable="option.disable" />
          </template>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="Novel">
            <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6">
              <q-grid-item v-for="book in bookData" :key="book['Id']">
                <book-card :book="book"></book-card>
              </q-grid-item>
            </q-grid>
          </q-tab-panel>
          <q-tab-panel name="Thread"></q-tab-panel>
        </q-tab-panels>
      </div>
      <q-page-sticky position="bottom-right" :offset="fabPos" style="z-index: 1">
        <q-btn round color="primary" size="md" :icon="icon.mdiDelete" @click="showConfirm = true" />
      </q-page-sticky>
      <q-dialog v-model="showConfirm">
        <q-card style="min-width: 200px">
          <q-card-section class="row items-center">是否清空阅读历史</q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="清空" color="primary" v-close-popup @click="confirmClear" />
            <q-btn flat label="取消" color="primary" v-close-popup @click="showConfirm = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { ref, defineComponent, computed } from 'vue'
import { getReadHistory, clearHistory } from 'src/services/user'
import BookCard from 'src/components/BookCard.vue'
import { getBookListByIds } from 'src/services/book'
import { BookInList } from 'src/services/book/types'
import { icon } from 'assets/icon'
import { QGrid, QGridItem } from 'src/components/grid'
import { useInitRequest } from 'src/composition/biz/useInitRequest'
import { useTimeoutFn } from 'src/composition/useTimeoutFn'

defineComponent({ QGrid, QGridItem })

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Novel',
    key: 'Novel',
    label: '小说',
    disable: false,
    icon: icon.mdiBook
  },
  {
    name: 'Thread',
    key: 'Thread',
    label: '帖子',
    disable: true,
    icon: icon.mdiForum
  }
]

const fabPos = ref([18, 18])
const tab = ref('Novel')
const bookData = ref<BookInList[]>([])
const history = ref<number[]>([])
const showConfirm = ref(false)
let size = 24
const totalPages = computed(() => Math.ceil(history.value.length / size) || 1)
const scroll = ref(null)

const confirmClear = async () => {
  await clearHistory()
    .then((res) => {
      bookData.value = []
    })
    .catch((error) => {
      console.log(error)
    })
}

const requestHistory = useTimeoutFn(async () => {
  await getReadHistory()
    .then((res) => {
      if (res) {
        history.value = res
        scroll.value.resume()
        scroll.value.poll()
      }
    })
    .catch((error) => {
      console.log(error)
    })
})
useInitRequest(requestHistory, {
  before: () => {
    bookData.value = []
    history.value = []
    scroll.value.reset()
  }
})

// 滚动拉取数据
const onLoad = async (index, done) => {
  await getBookListByIds(history.value.slice((index - 1) * size, index * size))
    .then((res) => {
      bookData.value.push(...res)
      if (index === totalPages.value) {
        // 无法再拉取
        scroll.value.stop()
      } else {
        done()
      }
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>

<style scoped lang="scss"></style>
