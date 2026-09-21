<template>
  <!-- 小说与漫画 -->
  <shelf-book v-if="isShelfBookItem(item)" :item="item" />
  <!-- 文件夹 -->
  <shelf-folder v-else :item="item" />
</template>

<script lang="ts" setup>
import { isShelfBookItem } from '@/types/shelf'

import ShelfBook from './ShelfBook.vue'
import ShelfFolder from './ShelfFolder.vue'

import type { ShelfItem } from '@/types/shelf'

defineProps<{ item: ShelfItem }>()
</script>
