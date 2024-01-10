<template>
  <div>
    <router-link :to="{ name: 'BookInfo', params: { bid: props.book.Id } }">
      <div class="book-cover">
        <q-card v-intersection.once="onIntersection">
          <div v-if="visible">
            <q-img v-if="cover" :src="cover" :ratio="2 / 3">
              <div v-if="book.Level || book.InteriorLevel" class="absolute-bottom bottom-shadow">
                <div class="row text-weight-bold">
                  <div>{{ book.Level && !book.InteriorLevel ? `Level ${book.Level}` : '' }}</div>
                  <q-space />
                  <div>{{ book.InteriorLevel ? `Level ${book.InteriorLevel}` : '' }}</div>
                </div>
              </div>
              <template v-if="book.Placeholder && generalSetting.enableBlurHash" v-slot:loading>
                <blur-hash :blurhash="book.Placeholder" />
              </template>
            </q-img>
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
import { computed, ref } from 'vue'
import { useToNowRef } from 'src/composition/useToNowRef'
import { BookInList } from 'src/services/book/types'
import { useQuasar } from 'quasar'
import BlurHash from 'src/components/BlurHash.vue'
import { useSettingStore } from 'stores/setting'

const settingStore = useSettingStore()
const { generalSetting } = settingStore // 引入setting用于控制图片自定义占位符
const $q = useQuasar()
const props = defineProps<{ book: BookInList }>()
const cover = computed(() => props.book.Cover)
const updateTime = useToNowRef(() => props.book.LastUpdateTime)
const visible = ref(false)
function onIntersection(entry: IntersectionObserverEntry) {
  visible.value = entry.isIntersecting
}
</script>

<style lang="scss" scoped>
@import 'src/css/mixin';

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
