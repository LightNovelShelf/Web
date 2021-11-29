<template>
  <div class="wrap" :class="{ [props.class]: true }">
    <div class="avatar">
      <img :src="data.Avatar" ref="imageRef" @load="loadedHandle" @error="loadedHandle" referrerPolicy="no-referrer" />
    </div>
    <div class="text_meta">
      <div class="nickname">{{ data.Title }}</div>
      <div class="description">{{ data.Description }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { Card } from '@/types/collaborator'
import { useResizeObserver } from '@/composition/useResizeObserver'

const props = defineProps<{ class?: string; data: Card }>()
const emit = defineEmits<{
  (event: 'resize'): void
}>()

const imageRef = ref<HTMLImageElement>(null)

const resizeHandle = () => {
  emit('resize')
}

/** 采用 ResizeObserver 降低card文字内容被遮挡的可能性 */
const { observer } = useResizeObserver(imageRef, resizeHandle)

const loadedHandle = () => {
  resizeHandle()
  observer.disconnect()
}
</script>

<style lang="scss" scoped>
.wrap {
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
  overflow: hidden;

  transition: transform 0.2s;

  &,
  &:deep(*) {
    box-sizing: border-box;
  }

  .avatar {
    font-size: 0;
    background-color: rgba(#000, 0.05);

    img {
      width: 100%;
      height: 100%;
      min-height: 100px;
      object-fit: cover;
      object-position: top center;
    }
  }
  .text_meta {
    color: #262626;
    margin: 16px;
    font-size: 14px;
    text-align: left;
  }
  .nickname {
    font-size: 24px;
    line-height: 1.33;
    font-weight: bold;
  }
  .description {
    line-height: 1.5;
    margin-top: 12px;
  }

  .nickname,
  .description {
    white-space: pre-line;
    word-break: break-all;
  }
}
</style>
