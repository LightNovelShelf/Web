<template>
  <div>
    <router-link :to="detailRoute">
      <div class="book-cover">
        <q-card v-intersection.once="onIntersection">
          <div v-if="visible">
            <system-image v-if="book.Cover" :url="book.Cover" :request-height="512" :ratio="2 / 3">
              <div v-if="book.Level || book.InteriorLevel" class="absolute-bottom bottom-shadow">
                <div class="row text-weight-bold">
                  <div>{{ book.Level && !book.InteriorLevel ? `Level ${book.Level}` : '' }}</div>
                  <q-space />
                  <div>{{ book.InteriorLevel ? `Level ${book.InteriorLevel}` : '' }}</div>
                </div>
              </div>
            </system-image>
            <q-responsive v-else :ratio="2 / 3">
              <q-skeleton class="fit" />
            </q-responsive>
          </div>
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

    <div class="extra" style="display: flex; padding: 0 4px">
      <div class="user-name">{{ book.UserName }}</div>
      <div class="time">{{ updateTime }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'

import SystemImage from '@/components/SystemImage.vue'

import { useToNowRef } from '@/composition/useToNowRef'

import type { BookInList } from '@/services/book/types'

const $q = useQuasar()
const props = defineProps<{ book: BookInList }>()
const detailRoute = computed(() =>
  props.book.Type === 'Comic'
    ? { name: 'MangaDetail', params: { seriesTitle: props.book.SeriesTitle || props.book.Title } }
    : { name: 'BookInfo', params: { bid: props.book.Id } },
)
const updateTime = useToNowRef(() => props.book.LastUpdatedAt)
const visible = ref(false)
function onIntersection(entry: IntersectionObserverEntry) {
  visible.value = entry.isIntersecting
  return true
}
</script>

<style lang="scss" scoped>
@import '@/css/mixin';

.book-cover {
  position: relative;
  box-sizing: border-box;
}

.book-cover :deep(.q-card) {
  overflow: hidden;
}

.book-cover :deep(.q-img) {
  transition: transform 0.25s ease;
}

.book-cover:hover :deep(.q-img) {
  transform: scale(1.025);
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
  align-items: flex-start;
  --line-height: 1.6;
  line-height: var(--line-height);
  font-size: 12px;
  height: calc(1em * var(--line-height) * 2);

  .book-name-text {
    @include ellipsis(2);
  }
}

.bottom-shadow {
  background-color: unset;
  background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
}

:deep(.q-img__content > div) {
  padding: 1px 4px;
}

.extra {
  --line-height: 1.5;
  opacity: 0.6;
  font-size: 12px;
  height: calc(1em * var(--line-height));

  .user-name {
    flex: 1;
    @include ellipsis(1);
  }

  .time {
    text-align: right;
  }
}
</style>
