<template>
  <q-img v-if="item.type === ShelfItemType.BOOK" :src="item.value.Cover" :ratio="2 / 3" />
  <div v-else-if="item.type === ShelfItemType.FOLDER"><q-icon size="24px" :name="mdiFolderHeartOutline" /></div>
  <template v-else />
</template>

<script lang="ts" setup>
import { mdiFolderHeartOutline } from '@/plugins/icon/export'
import { ShelfItem, ShelfItemType } from '@/types/shelf'

defineProps<{ item: ShelfItem }>()
</script>
