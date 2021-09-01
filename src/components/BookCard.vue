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
      <n-element tag="div" class="book-tag">
        <span style="font-size: 12px">录入</span>
      </n-element>
    </template>
    <template #footer>
      <div style="display: flex; padding: 0 4px">
        <n-text depth="3">无语</n-text>
        <div class="flex-space"></div>
        <n-text depth="3">1小时前</n-text>
      </div>
    </template>
    <div class="book-name">
      <div class="book-name-text" :title="book['Title']">
        {{ book['Title'] }}
      </div>
    </div>
  </n-card>
</template>

<script>
import { defineComponent } from 'vue'
import { midPic } from '../utils/book'

export default defineComponent({
  name: 'bookCard',
  props: {
    book: Object
  },
  computed: {
    midPic() {
      return midPic(this.book['Cover'])
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
  background-color: var(--primary-color);
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
