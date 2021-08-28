<template>
  <n-card content-style="padding: 4px;">
    <template #cover>
      <div
        :style="{
          paddingBottom: '150%',
          backgroundImage: `url('${book.cover}')`,
          backgroundSize: 'cover'
        }"
      >
      </div>
      <n-element tag="div" class="book-tag">
        <span style="font-size: 12px">录入</span>
      </n-element>
    </template>
    <div class="book-name">
      <div class="book-name-text" :title="book.name">
        {{ book.name }}
      </div>
    </div>
  </n-card>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'bookCard',
  props: {
    book: Object
  }
})
</script>

<style lang="scss" scoped>
@import '../assets/style/mixin';

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
