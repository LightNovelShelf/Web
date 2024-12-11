<template>
  <!-- 书籍 -->
  <shelf-book v-if="item.type === ShelfItemTypeEnum.BOOK" :item="item" />
  <!-- 文件夹 -->
  <shelf-folder v-else-if="item.type === ShelfItemTypeEnum.FOLDER" :item="item" />
  <!-- 其余：未知 -->
  <template v-else />
</template>

<script lang="ts" setup>
import type { ShelfItem } from 'src/types/shelf'
import { ShelfItemTypeEnum } from 'src/types/shelf'
import ShelfFolder from './ShelfFolder.vue'
import ShelfBook from './ShelfBook.vue'

defineProps<{ item: ShelfItem }>()
</script>
