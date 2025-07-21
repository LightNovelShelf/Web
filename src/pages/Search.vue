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
              v-model="state.searchKey"
              @search="onSearch"
            />
          </div>
          <div class="q-gutter-y-md">
            <q-tabs dense v-model="state.tab" class="text-teal">
              <template v-for="option in tabOptions" :key="option.key">
                <q-tab :disable="option.disable" :name="option.name" :icon="option.icon" :label="option.label" />
              </template>
            </q-tabs>
            <q-tab-panels v-model="state.tab" animated>
              <q-tab-panel name="Book">
                <template v-if="state.bookData.length">
                  <q-grid :x-gap="12" :y-gap="8" cols="6" xs="3" sm="4" md="5" xl="6" lg="6" style="margin-top: 12px">
                    <q-grid-item v-for="book in state.bookData" :key="book['Id']">
                      <book-card :book="book"></book-card>
                    </q-grid-item>
                  </q-grid>
                </template>
                <template v-else-if="!state.loading">
                  <div class="row justify-center q-my-md text-center text-h5">
                    无<template v-if="state.extra">精确</template>搜索结果
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSettingStore } from 'src/stores/setting'

import BookCard from 'components/BookCard.vue'
import { QGrid, QGridItem } from 'components/grid'
import SearchInput from 'components/SearchInput.vue'

import { getBookList } from 'src/services/book'

const router = useRouter()
const route = useRoute()
const { generalSetting } = useSettingStore()
const scrollEleInstanceRef = ref<null | {
  stop(): void
  reset(): void
  resume(): void
  poll(): void
}>(null)
const state = ref({
  // 部分组件会在setup初始化，所以不能等 onMounted 等周期再对state内容初始化
  /** 搜索关键词 @description 用户输入是啥就是啥 */
  searchKey: '' + (route.query?.keywords ?? ''),
  /** 精确搜索 */
  extra: !!route.query?.exact,

  /** 当前tab */
  tab: 'Book',

  /** 书籍数据 */
  bookData: [],

  /** 搜索结果加载态 @TODO: 使用 useRequest 代替手动管理 */
  loading: false,
})

const searchInputWidth = () => '60vw'
const requestBook = async (index: number, done: (stop?: boolean) => void) => {
  state.value.loading = true
  try {
    const KeyWords = state.value.extra ? `"${state.value.searchKey}"` : state.value.searchKey

    const res = await getBookList({
      Page: index,
      Size: 24,
      KeyWords: KeyWords,
      IgnoreJapanese: generalSetting.ignoreJapanese,
      IgnoreAI: generalSetting.ignoreAI,
    })
    state.value.bookData.push(...res.Data)
    if (res.TotalPages === index || res.TotalPages === 0) scrollEleInstanceRef.value.stop()
    else done()
  } finally {
    state.value.loading = false
  }
}

function onSearch(val: string, exact: boolean) {
  state.value.searchKey = val
  state.value.extra = exact

  // sync state to url, so it can restore after refresh
  router.replace({ name: 'Search', query: { keywords: val, exact: exact ? '1' : '' } })

  triggerSearchReq()
}

/** 重新初始化搜素 */
function triggerSearchReq() {
  const instance = scrollEleInstanceRef.value
  if (!instance) {
    return
  }

  instance.reset()
  instance.resume()
  // 通过 q-infinite-scroll 的 poll 方法来触发加载
  instance.poll()

  // 数组在这重置还有一层用意：触发滚动容器回调；poll调用后理应就会触发回调，但实际情况并非如此
  // TODO: 探明滚动容器触发条件
  state.value.bookData.length = 0
}

/** 从url上提取搜索关键词，触发请求 @idempotent 对外幂等 */
function tryResyncSearchStateFromUrl(toRoute = route) {
  const keyword = '' + (toRoute.query?.keywords ?? '')
  const isExact = !!toRoute.query?.exact

  const isSameSearchQuery = keyword === state.value.searchKey && isExact === state.value.extra
  // 搜索条件对比url上的没变就不再触发
  if (isSameSearchQuery) return

  state.value.searchKey = keyword
  state.value.extra = isExact
  triggerSearchReq()
}

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

// 初始化
onMounted(tryResyncSearchStateFromUrl)
onActivated(tryResyncSearchStateFromUrl)
onBeforeRouteUpdate(tryResyncSearchStateFromUrl)
</script>

<style scoped lang="scss"></style>
