<script lang="tsx" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import masonry from 'masonry-layout'
import { debounce } from 'lodash-es'
import { useMedia } from '@/composition/useMedia'
import { CardSize } from '@/types/collaborator'

import { useCollaborators } from './store'

import CardItem from './components/Card.vue'

/** 数据源 */
const { collaborators } = useCollaborators()
/** 节点记录 */
const masonryWrapNodeRef = ref<HTMLDivElement>(document.createElement('div'))
/** masonry实例 */
const masonryInstance = ref<masonry>(new masonry(masonryWrapNodeRef.value))

/** 是否是宽屏，设置图片为对应大小央视 */
const isWide = useMedia(ref('(min-width: 1080px)'))
/** 预设大小枚举 */
const size = computed<CardSize>(() => {
  return isWide ? CardSize.normal : CardSize.small
})

/** 内部图片加载完毕等，重新触发一次masonry排版 */
const relayoutHandle = debounce(
  () => {
    masonryInstance.value.layout()
  },
  50,
  { trailing: true }
)

onMounted(() => {
  masonryInstance.value = new masonry(masonryWrapNodeRef.value, {
    itemSelector: '.grid-item',
    gutter: 15,
    fitWidth: true,
    // 这里我也忘了原来什么情况下有nano，可能原本有后来又没了（需求变更），这里先写下
    columnWidth: size.value === CardSize.nano ? 100 : 240
  })
})
onBeforeUnmount(() => {
  masonryInstance.value.destory()
})
</script>
<template>
  <div class="com_waterfall_container">
    <div class="com_waterfall_list" ref="masonryWrapNodeRef">
      <!-- grid-item 这个class是给masonry定位子元素用的 -->
      <card-item
        v-for="item in collaborators"
        :key="item.key"
        class="grid-item"
        :data="item"
        :size="size"
        @resize="relayoutHandle"
      />
    </div>
  </div>
</template>
<style lang="scss">
.com_waterfall_container {
  background-color: #eee;
  color: rgba(#000, 0.87);
  letter-spacing: 0.01071em;
  font-weight: 400;
  width: 75vw;
  margin-left: auto;
  margin-right: auto;
  &,
  & * {
    box-sizing: border-box;
  }

  .com_waterfall_list {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
