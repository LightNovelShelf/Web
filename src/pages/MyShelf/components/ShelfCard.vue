<template>
  <!-- 小说与漫画 -->
  <shelf-book v-if="isShelfBookItem(item)" :item="item" />
  <!-- 文件夹 -->
  <shelf-folder v-else :item="item" :book-kind="bookKind" />
</template>

<script lang="ts" setup>
import { isShelfBookItem } from '@/types/shelf'

import ShelfBook from './ShelfBook.vue'
import ShelfFolder from './ShelfFolder.vue'

import type { ShelfBookType, ShelfItem } from '@/types/shelf'

defineProps<{
  item: ShelfItem
  /** 书架正在筛选的类型；文件夹的封面与计数要跟着只算这一类 */
  bookKind: ShelfBookType | null
}>()
</script>
