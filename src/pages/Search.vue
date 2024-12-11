<template>
  <q-page padding>
    <!-- todo 不懂他为什么不能放在q-tab-panel里面 -->
    <q-infinite-scroll @load="requestBook" :offset="100" ref="scrollEleInstanceRef">
      <template #default>
        <div class="q-gutter-y-md">
          <div class="row flex-center">
            <!-- <q-input rounded outlined dense v-model="searchKey" @keyup.enter="search" /> -->
            <search-input
              outlined
              dense
              :width="searchInputWidth"
              max-width="600px"
              v-model="searchKeyInInput"
              @search="onSearch"
            />
          </div>
          <div class="q-gutter-y-md">
            <q-tabs dense v-model="tab" class="text-teal">
              <template v-for="option in tabOptions" :key="option.key">
                <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
              </template>
            </q-tabs>
            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="Book">
                <template v-if="bookData.length">
                  <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
                    <q-grid-item v-for="book in bookData" :key="book['Id']">
                      <book-card :book="book"></book-card>
                    </q-grid-item>
                  </q-grid>
                </template>
                <template v-else-if="!loading">
                  <div class="row justify-center q-my-md text-center text-h5">
                    无<template v-if="isExactInRoute">精确</template>搜索结果
                  </div>
                </template>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </template>
      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { getBookList } from 'src/services/book'
import { QGrid, QGridItem } from 'components/grid'
import BookCard from 'components/BookCard.vue'
import type { BookInList } from 'src/services/book/types'
import { useRouter } from 'vue-router'
import SearchInput from 'components/SearchInput.vue'

const router = useRouter()
const route = useRoute()
const scrollEleInstanceRef = ref<null | {
  stop(): void
  reset(): void
  resume(): void
  poll(): void
}>(null)
const loading = ref(false)

/** 移除精确搜索的双引号 */
function getTrimmedKeyword(str: string) {
  return str.replace(/^"(.+)"$/, '$1')
}

/** 数组的最后一个，如果不是数组就返回输入值 */
function last(param: string | string[]): string {
  if (Array.isArray(param)) {
    return param[param.length - 1]
  }

  return param
}

const isExactInRoute = computed(() => {
  const exact = !!last(route.query?.exact ?? '')
  return exact
})

/**
 * 路由上指定的关键词
 *
 * @desc
 * 这里就组装好数据是为了简化watch逻辑：keyword和extra变了都要初始化，
 *
 * 但初始化逻辑中体现不了对 exact 的使用，所以退而求其次放这里来了，简化维护是心智负担
 */
const searchKeyInRoute = computed(() => {
  const keyword = last(route.params?.keyWords ?? '')
  return isExactInRoute.value ? `"${keyword}"` : keyword
})

/** 仅用作search-input的受控记录 */
const searchKeyInInput = ref('')
const searchInputWidth = () => {
  return '60vw'
}
const requestBook = async (index: number, done: (stop?: boolean) => void) => {
  loading.value = true
  try {
    const res = await getBookList({ Page: index, Size: 24, KeyWords: searchKeyInRoute.value })
    bookData.push(...res.Data)
    if (res.TotalPages === index || res.TotalPages === 0) scrollEleInstanceRef.value.stop()
    else done()
  } finally {
    loading.value = false
  }
}

function onSearch(val: string, exact: boolean) {
  router.push({ name: 'Search', params: { keyWords: val }, query: { exact: exact ? '1' : '' } })
}

// 同步路由的值到input中并触发容器初始化
watch(
  [searchKeyInRoute, scrollEleInstanceRef],
  ([nextSearchKey, instance]) => {
    if (!instance) {
      return
    }
    searchKeyInInput.value = getTrimmedKeyword(nextSearchKey)

    instance.reset()
    instance.resume()
    instance.poll()

    // 数组在这重置还有一层用意：触发滚动容器回调；poll调用后理应就会触发回调，但实际情况并非如此
    // TODO：探明滚动容器触发条件
    bookData.length = 0
  },
  { immediate: true },
)
const tabOptions: Array<Record<string, any>> = [
  {
    name: 'Book',
    key: 'Book',
    label: '小说',
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
  {
    name: 'User',
    key: 'User',
    label: '用户',
    icon: 'mdiAccount',
    disable: true,
  },
]
const tab = ref('Book')
const bookData = reactive<BookInList[]>([])
</script>

<style scoped lang="scss"></style>
