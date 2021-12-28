<template>
  <div>
    <router-link :to="{ name: 'BookInfo', params: { bid: props.book.Id } }">
      <div class="book-cover">
        <q-card v-intersection.once="onIntersection">
          <q-img v-if="visible" :src="cover" :ratio="2 / 3" />
          <q-responsive v-else :ratio="2 / 3" />
        </q-card>

        <div class="book-tag" :style="{ backgroundColor: book.Category?.Color }">
          <span style="font-size: 12px">{{ $q.screen.gt.md ? book.Category?.Name : book.Category?.ShortName }}</span>
        </div>
      </div>
    </router-link>

    <div style="padding: 4px">
      <div class="book-name">
        <div class="book-name-text" :title="book?.Title">
          {{ book.Title }}
        </div>
      </div>
    </div>

    <div class="text-grey-7" style="display: flex; padding: 0 4px">
      <div>{{ book.UserName }}</div>
      <div class="flex-space"></div>
      <div>{{ updateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useToNow } from '@/composition/useToNow'
import { BookInList } from '@/services/book/types'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps<{ book: BookInList }>()
const cover = computed(() => props.book.Cover)
const updateTime = useToNow(computed(() => props.book.LastUpdateTime))
const visible = ref(false)
function onIntersection(entry) {
  visible.value = entry.isIntersecting
}
</script>

<style lang="scss" scoped>
@import '../assets/style/mixin';

.book-cover {
  position: relative;
  box-sizing: border-box;
}

.book-tag {
  position: absolute;
  top: 8px;
  right: 0;
  color: white;
  padding: 0 3px 0 6px;
  border-radius: 1em 0 0 1em;
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
</style>
