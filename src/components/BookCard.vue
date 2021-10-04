<template>
  <n-card :bordered="false" content-style="padding: 4px;" footer-style="padding: 0">
    <template #cover>
      <div
        :style="{
          paddingBottom: '150%',
          backgroundImage: `url('${midPic}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }"
      >
      </div>
      <div class="book-tag" :style="{ backgroundColor: themeVars.primaryColor }">
        <span style="font-size: 12px">{{ book.Category?.ShortName }}</span>
      </div>
    </template>
    <template #footer>
      <div style="display: flex; padding: 0 4px">
        <n-text depth="3">{{ book.UserName }}</n-text>
        <div class="flex-space"></div>
        <n-text depth="3">{{ updateTime }}</n-text>
      </div>
    </template>
    <div class="book-name">
      <div class="book-name-text" :title="book?.Title">
        {{ book.Title }}
      </div>
    </div>
  </n-card>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { midPic } from '@/utils/book'
import { useToNow } from '@/composition/useToNow'
import { useThemeVars } from 'naive-ui'

export default defineComponent({
  name: 'bookCard',
  props: {
    book: {
      type: Object
    }
  },
  setup(props) {
    let themeVars = useThemeVars()

    return {
      themeVars,
      midPic: computed(() => midPic(props.book.Cover)),
      updateTime: useToNow(computed(() => props.book.LastUpdateTime))
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../assets/style/mixin';

:deep(.n-card-cover) {
  border: 1px solid var(--border-color);
  box-sizing: border-box;
}

.book-tag {
  position: absolute;
  top: 6px;
  right: 0;
  color: white;
  padding: 0 3px 0 6px;
  border-radius: 1em 0 0 1em;
}

.book-name {
  display: flex;
  align-items: center;
  --font-size: 12px;
  font-size: var(--font-size);
  height: calc(var(--font-size) * var(--line-height) * 2);

  .book-name-text {
    @include ellipsis(2);
  }
}
</style>
