<template>
  <div v-intersection.once="queryItem">
    <folder-card :title="item.title" :covers="covers" :count="bookCount" :to="to">
      <template #footer>
        <div class="text-grey-7" style="display: flex; padding: 0 4px; font-size: 12px">
          <div>{{ subFolderCount ? `${subFolderCount} 个文件夹` : '' }}</div>
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
import { ShelfBranch, useShelfStore } from '@/stores/shelf'

import FolderCard from '@/components/FolderCard.vue'
import TimeAgo from '@/components/TimeAgo.vue'

import { ShelfItemTypeEnum } from '@/types/shelf'

import type { ShelfFolderItem } from '@/types/shelf'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{ item: ShelfFolderItem }>()
const shelfStore = useShelfStore()
const listDataStore = useBookListStore()

const folderIDs = computed(() => [...props.item.parents, props.item.id])
// 整理模式下点卡片是选中，进文件夹走卡片上的打开按钮
const to = computed<RouteLocationRaw | undefined>(() =>
  shelfStore.branch === ShelfBranch.draft ? undefined : { name: 'MyShelf', params: { folderID: folderIDs.value } },
)
/** 文件夹内所有层级的书籍，封面和数量都按整棵子树算 */
const booksInTree = computed(() => shelfStore.booksInFolderTree(props.item.id))
const bookCount = computed(() => booksInTree.value.length)
const subFolderCount = computed(
  () => shelfStore.getItemsByParents(folderIDs.value).filter((item) => item.type === ShelfItemTypeEnum.FOLDER).length,
)
// 限制最多四本书的封面
const covers = computed<string[]>(() =>
  booksInTree.value
    .map((i) => listDataStore.getBook(i.id)?.Cover)
    .filter((c): c is string => !!c)
    .slice(0, 4),
)

/** 查询相关item */
function queryItem(entry: IntersectionObserverEntry) {
  if (entry.isIntersecting) {
    listDataStore.queryBooks({ ids: booksInTree.value.slice(0, 4).map((o) => o.id) })
  }
  return true
}
</script>
