<template>
  <book-card v-intersection.once="queryItem" :book="book" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useBookListStore } from 'stores/bookListData'

import BookCard from 'components/BookCard.vue'

import type { ShelfBookItem } from 'src/types/shelf'

const props = defineProps<{ item: ShelfBookItem }>()
const listDataStore = useBookListStore()
const book = computed(() => listDataStore.getBook(props.item.id))

/** 查询相关item */
function queryItem(entry: IntersectionObserverEntry) {
  const { item } = props
  if (entry.isIntersecting && item) {
    listDataStore.queryBooks({ ids: [item.id] })
  }
  return true
}
</script>
