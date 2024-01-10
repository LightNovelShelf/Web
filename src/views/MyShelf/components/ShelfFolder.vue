<template>
  <div v-intersection.once="queryItem">
    <router-link :to="{ name: 'MyShelf', params: { folderID: folderIDs } }">
      <div class="book-cover">
        <q-card>
          <q-responsive :ratio="2 / 3">
            <div class="books-group">
              <q-img
                class="books-group-cover"
                v-for="item in limitedBooks"
                :key="item.Id"
                :src="item.Cover"
                :ratio="2 / 3"
              >
                <template v-if="item.Placeholder && generalSetting.enableBlurHash" v-slot:loading>
                  <blur-hash :blurhash="item.Placeholder" />
                </template>
              </q-img>
            </div>
          </q-responsive>
        </q-card>
      </div>
    </router-link>

    <div style="padding: 4px">
      <div class="book-name">
        <div class="book-name-text" :title="item.title">
          {{ item.title }}
        </div>
      </div>
    </div>

    <div class="text-grey-7" style="display: flex; padding: 0 4px; font-size: 12px">
      <div> </div>
      <div class="flex-space"></div>
      <div>{{ updateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useToNowRef } from 'src/composition/useToNowRef'
import { ShelfBookItem, ShelfFolderItem, ShelfItemTypeEnum } from 'src/types/shelf'
import { useShelfStore } from 'stores/shelf'
import { useBookListStore } from 'stores/bookListData'
import { BookInList } from 'src/services/book/types'
import BlurHash from 'src/components/BlurHash.vue'
import { useSettingStore } from 'stores/setting'

const props = defineProps<{ item: ShelfFolderItem }>()
const shelfStore = useShelfStore()
const settingStore = useSettingStore()
const { generalSetting } = settingStore
const updateTime = useToNowRef(() => new Date(props.item.updateAt))
const folderIDs = computed(() => [...props.item.parents, props.item.id])
const listDataStore = useBookListStore()
// 限制最多四本书
const limitedBooks = computed<BookInList[]>(() =>
  shelfStore
    .getItemsByParent(props.item.id)
    .filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
    .map((i) => listDataStore.getBook(i.id))
    .slice(0, 4)
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
        .map((o) => o.id)
    })
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixin';

.book-cover {
  position: relative;
  box-sizing: border-box;
}

.books-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  padding: 10px;
}

.books-group-cover {
  border-radius: 4px;
}

.book-name {
  display: flex;
  align-items: flex-start;
  --font-size: 12px;
  --line-height: 1.6;
  line-height: var(--line-height);
  font-size: var(--font-size);
  height: calc(var(--font-size) * var(--line-height) * 2);

  .book-name-text {
    @include ellipsis(2);
  }
}
</style>
