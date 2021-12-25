<template>
  <div>
    <router-link :to="{ name: 'BookInfo', params: { bid: props.folder.Id } }">
      <div class="book-cover">
        <q-card>
          <q-img :src="cover" :ratio="2 / 3" />
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
      <!-- @todo debug -->
      <div>{{ folder.children.length }}</div>
      <div class="flex-space"></div>
      <div>{{ updateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useToNow } from '@/composition/useToNow'
import { useQuasar } from 'quasar'
import { ShelfFolder } from '@/types/shelf'

const $q = useQuasar()
const props = defineProps<{ folder: ShelfFolder }>()
const cover = computed(() => '')
const updateTime = useToNow(computed(() => new Date(props.folder.createAt)))
</script>

<style lang="scss" scoped>
@import '~@/assets/style/mixin';

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
