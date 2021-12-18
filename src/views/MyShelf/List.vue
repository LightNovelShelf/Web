<template>
  <q-grid cols="8" x-gap="20" y-gap="20" :forward-ref="setListWrapRef">
    <template v-for="item in books" :key="item.value.Id">
      <q-grid-item class="js-drag-item" draggable="true" :data-id="item.value.Id">
        <book-card :book="item.value" />
      </q-grid-item>
    </template>
  </q-grid>
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard.vue'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as ShelfTypes from '@/types/shelf'
import { useForwardRef } from '@/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from '@/utils/safeCall'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard })

const loading = ref(true)
const books = ref<ShelfTypes.SheldItem[]>([])
const [listWrapRef, setListWrapRef] = useForwardRef()
const sortableRef = ref<Sortable | null>(null)
/** 清理排序句柄 */
const destorySortable = () => {
  safeCall(() => sortableRef.value?.destroy())
}

/** 创建排序句柄 */
const createSSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, { animation: 200 })
}

/** 监控组件挂载情况，挂载了就初始化排序 */
watch(listWrapRef, (el) => {
  destorySortable()
  if (el) {
    createSSortable(el)
  }
})

/** 排序书籍数组 */
const sortBooks = () => {
  books.value.sort((a, b) => a.index - b.index)
}

// 初始化
onMounted(() => {
  // 全量读取列表
  shelfDB.getItems<ShelfTypes.SheldItem>().then((res) => {
    books.value = res
    // @debug 调试环境里书架的图片地址都是旧的，懒得重新造数据，这里替换一下域名算了
    books.value = books.value.map((item) => {
      if (item.type === ShelfTypes.SheldItemType.book) {
        item.value.Cover = item.value.Cover.replace('img.acgdmzy.com:45112', 'img.lightnovel.app:45220')
      }
      return item
    })
    // @debug end
    sortBooks()
    loading.value = false
  })
})

onBeforeUnmount(() => {
  destorySortable()
})
</script>

<style lang="scss" scoped>
:deep {
  .gu-transit {
    opacity: 0.6;
  }
}
</style>
