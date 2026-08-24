<template>
  <div v-intersection.once="queryItem">
    <folder-card :title="item.title" :covers="covers" :to="{ name: 'MyShelf', params: { folderID: folderIDs } }">
      <template #footer>
        <div class="text-grey-7" style="display: flex; padding: 0 4px; font-size: 12px">
          <div></div>
          <div class="col"></div>
          <div><time-ago :value="item.updateAt" /></div>
        </div>
      </template>
    </folder-card>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useBookListStore } from '@/stores/bookListData'
import { useShelfStore } from '@/stores/shelf'

import FolderCard from '@/components/FolderCard.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { ShelfItemTypeEnum } from '@/types/shelf'

import type { ShelfBookItem, ShelfFolderItem } from '@/types/shelf'

const props = defineProps<{ item: ShelfFolderItem }>()
const shelfStore = useShelfStore()
const folderIDs = computed(() => [...props.item.parents, props.item.id])
const listDataStore = useBookListStore()
// 限制最多四本书的封面
const covers = computed<string[]>(() =>
  shelfStore
    .getItemsByParent(props.item.id)
    .filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
    .map((i) => listDataStore.getBook(i.id)?.Cover)
    .filter((c): c is string => !!c)
    .slice(0, 4),
)

/** 查询相关item */
function queryItem(entry: IntersectionObserverEntry) {
  const { item } = props
  if (entry.isIntersecting && item) {
    listDataStore.queryBooks({
      ids: shelfStore
        .getItemsByParent(item.id)
        .filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
        .slice(0, 4)
        .map((o) => o.id),
    })
  }
  return true
}
</script>
