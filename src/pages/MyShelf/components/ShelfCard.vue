<template>
  <!-- 书籍 -->
  <shelf-book v-if="item.type === ShelfItemTypeEnum.BOOK" :item="item" />
  <!-- 文件夹 -->
  <shelf-folder v-else-if="item.type === ShelfItemTypeEnum.FOLDER" :item="item" />
  <!-- 其余：未知 -->
  <template v-else />
</template>

<script lang="ts" setup>
import { ShelfItemTypeEnum } from 'src/types/shelf'

import type { ShelfItem } from 'src/types/shelf'

import ShelfBook from './ShelfBook.vue'
import ShelfFolder from './ShelfFolder.vue'

defineProps<{ item: ShelfItem }>()
</script>
