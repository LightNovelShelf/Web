<template>
  <div>
    <router-link :to="{ name: 'BookInfo', params: { bid: props.folder.Id } }">
      <div class="book-cover">
        <q-card>
          <transition-group name="shelf-item" tag="div" class="books-group">
            <shelf-item-thumb v-for="item in limitedBooks" :key="item.id" :item="item" />
          </transition-group>
        </q-card>
      </div>
    </router-link>

    <div style="padding: 4px">
      <div class="book-name">
        <div class="book-name-text" :title="folder?.Title">
          {{ folder.Title }}
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
import { computed, watch } from 'vue'
import { useToNow } from '@/composition/useToNow'
import { ShelfFolder } from '@/types/shelf'
import { useShelfStore } from '@/store/shelf'
import ShelfItemThumb from './ShelfItemThumb.vue'

const props = defineProps<{ folder: ShelfFolder }>()
const store = useShelfStore()
const updateTime = useToNow(computed(() => new Date(props.folder.updateAt)))
// 限制最多四本书
const limitedBooks = computed(() => store.getItemByIDs(props.folder.children.map((i) => i.id)))
console.log('limitedBooks', limitedBooks)
watch(limitedBooks, (next) => {
  console.log('limitedBooks', next)
})
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
  align-items: center;
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
