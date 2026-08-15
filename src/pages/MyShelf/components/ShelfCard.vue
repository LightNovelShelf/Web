<template>
  <!-- 书籍 -->
  <shelf-book v-if="item.type === ShelfItemTypeEnum.BOOK" :item="item" />
  <!-- 文件夹 -->
  <shelf-folder v-else-if="item.type === ShelfItemTypeEnum.FOLDER" :item="item" />
  <!-- 其余：未知 -->
  <template v-else />
</template>

<script lang="ts" setup>
import { ShelfItemTypeEnum } from '@/types/shelf'

import ShelfBook from './ShelfBook.vue'
import ShelfFolder from './ShelfFolder.vue'

import type { ShelfItem } from '@/types/shelf'

defineProps<{ item: ShelfItem }>()
</script>
