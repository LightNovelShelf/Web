<template>
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
    <template v-slot:loading>
      <div class="row justify-center q-my-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </template>
  </q-infinite-scroll>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { getReadHistory } from '@/services/user'
import BookCard from '@/components/BookCard.vue'
import { getBookListByIds } from '@/services/book'
import { BookInList } from '@/services/book/types'
import { icon } from '@/plugins/icon'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import { useInitRequest } from '@/composition/biz/useInitRequest'
import { useTimeoutFn } from '@/composition/useTimeoutFn'

defineComponent({ QGrid, QGridItem })

const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Novel',
    key: 'Novel',
    label: '小说',
    disable: false,
    icon: icon.mdiCog
  },
  {
    name: 'Thread',
    key: 'Thread',
    label: '帖子',
    disable: true,
    icon: icon.mdiFormatSize
  }
]

const tab = ref('Novel')
const bookData = ref<BookInList[]>([])
const history = ref<number[]>([])
let size = 24
const totalPages = ref(1)
const scroll = ref(null)

const requestHistory = useTimeoutFn(async () => {
  bookData.value = []
  history.value = []
  scroll.value.reset()
  await getReadHistory()
    .then((res) => {
      if (res) {
        history.value = res
        totalPages.value = Math.ceil(history.value.length / size)
        scroll.value.resume()
        scroll.value.poll()
      }
    })
    .catch((error) => {
      console.log(error)
    })
})
useInitRequest(requestHistory)

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
