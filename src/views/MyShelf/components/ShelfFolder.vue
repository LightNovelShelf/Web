<template>
  <div ref="wrapRef">
    <router-link :to="{ name: 'MyShelf', params: { folderID: folderIDs } }">
      <div class="book-cover">
        <q-card>
          <q-responsive :ratio="2 / 3">
            <transition-group name="shelf-item" tag="div" class="books-group">
              <!-- <shelf-item-thumb v-for="item in limitedBooks" :key="item.id" :item="item" /> -->
              <template v-for="item in limitedBooks" :key="item.id">
                <q-img :src="item.Cover" :ratio="2 / 3" />
                <!-- <div v-else-if="item.type === ShelfItemTypeEnum.FOLDER"
                  ><q-icon size="24px" :name="mdiFolderHeartOutline"
                /></div> -->
                <!-- <template v-else /> -->
              </template>
            </transition-group>
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

    <div class="text-grey-7" style="display: flex; padding: 0 4px">
      <div> </div>
      <div class="flex-space"></div>
      <div>{{ updateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useToNow } from '@/composition/useToNow'
import { ShelfBookItem, ShelfFolderItem, ShelfItemTypeEnum } from '@/types/shelf'
import { useShelfStore } from '@/store/shelf'
import { usebookListStore } from '@/store/bookListData'
import { BookInList } from '@/services/book/types'

const props = defineProps<{ item: ShelfFolderItem }>()
const shelfStore = useShelfStore()
const updateTime = useToNow(computed(() => new Date(props.item.updateAt)))
const folderIDs = computed(() => [...props.item.parents, props.item.id])
const listDataStore = usebookListStore()
// 限制最多四本书
const limitedBooks = computed<BookInList[]>(() =>
  shelfStore
    .getItemsByParent(props.item.id)
    .filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
    .map((i) => listDataStore.getBook(i.id))
    .slice(0, 4)
)

const wrapRef = ref<HTMLDivElement | null>(null)
const unWatch = watch(wrapRef, (ele, preEle, onClean) => {
  if (ele) {
    const ob = new IntersectionObserver(
      ([item]) => {
        if (item.intersectionRatio > 0) {
          queryItem(true, () => {
            unWatch()
            ob.disconnect()
          })
        }
      },
      { threshold: 0, root: null, rootMargin: '10px' }
    )

    ob.observe(ele)

    onClean(() => ob.disconnect())
  }
})

/** 查询相关item */
function queryItem(visible: boolean, clean?: () => void) {
  const { item } = props
  if (visible && item) {
    listDataStore.queryBooks({
      ids: shelfStore
        .getItemsByParent(item.id)
        .filter((i): i is ShelfBookItem => i.type === ShelfItemTypeEnum.BOOK)
        .slice(0, 3)
        .map((o) => o.id)
    })

    clean && clean()
  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/style/mixin';

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

// 列表项动画
.shelf-item-enter-active,
.shelf-item-enter-move,
.shelf-item-leave-active {
  // 移动的动画需要换成flex才能做
  transition: all var(--q-transition-duration);
  // transition: all 5s;
}

.shelf-item-enter-from,
.shelf-item-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20%);
}
</style>
