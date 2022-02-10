<template>
  <!-- q-intersection 功能上也是OK，但弄不明白用法，每次都进来时就触发 visibility -->
  <!-- <q-intersection :threshold="0.01" :disable="disabeled" @visibility="queryItem"> -->
  <div ref="wrapRef">
    <book-card v-if="item.type === ShelfItemTypeEnum.BOOK" :book="book" />
  </div>
  <!-- </q-intersection> -->
</template>

<script lang="ts" setup>
import BookCard from '@/components/BookCard.vue'
import { usebookListStore as useBookListStore } from '@/store/bookListData'
import { useShelfStore } from '@/store/shelf'
import { ShelfBookItem, ShelfItemTypeEnum } from '@/types/shelf'
import { ref, watch } from 'vue'

const props = defineProps<{ item: ShelfBookItem }>()
const wrapRef = ref<HTMLDivElement | null>(null)
const listDataStore = useBookListStore()
const shelfStore = useShelfStore()
const book = listDataStore.getBook(props.item.id)
const unWatch = watch(wrapRef, (ele, preEle, onClean) => {
  if (ele) {
    const ob = new IntersectionObserver(
      ([item]) => {
        if (item.intersectionRatio > 0) {
          queryItem(true, () => {
            unWatch()
            ob.disconnect()
          })
        }
      },
      { threshold: 0, root: null, rootMargin: '10px' }
    )

    ob.observe(ele)

    onClean(() => ob.disconnect())
  }
})

/** 查询相关item */
function queryItem(visible: boolean, clean?: () => void) {
  const { item } = props
  if (visible && item) {
    listDataStore.queryBooks({ ids: [item.id] })

    clean && clean()
  }
}
</script>
