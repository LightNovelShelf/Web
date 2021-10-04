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
/** 列表容器 */
const masonryContainerNodeRef = ref<HTMLDivElement>(document.createElement('div'))
/** 列表节点 */
const masonryListNodeRef = ref<HTMLDivElement>(document.createElement('div'))
/** masonry实例 */
const masonryInstance = ref<masonry>(new masonry(masonryListNodeRef.value))

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

const resizeObserver = new ResizeObserver(relayoutHandle)

onMounted(() => {
  masonryInstance.value = new masonry(masonryListNodeRef.value, {
    itemSelector: '.grid-item',
    gutter: 15,
    fitWidth: true,
    // 这里我也忘了原来什么情况下有nano，可能原本有后来又没了（需求变更），这里先写下
    columnWidth: size.value === CardSize.nano ? 100 : 240
  })

  /** 监听布局变化（侧边菜单展开等） */
  resizeObserver.observe(masonryContainerNodeRef.value)
})
onBeforeUnmount(() => {
  masonryInstance.value.destory()
  resizeObserver.disconnect()
})
</script>
<template>
  <!-- com_waterfall_container宽随父容器 -->
  <div class="com_waterfall_container" ref="masonryContainerNodeRef">
    <!-- com_waterfall_list宽随子元素 -->
    <div class="com_waterfall_list" ref="masonryListNodeRef">
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
  color: rgba(#000, 0.87);
  letter-spacing: 0.01071em;
  max-width: 100%;
  font-weight: 400;
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
