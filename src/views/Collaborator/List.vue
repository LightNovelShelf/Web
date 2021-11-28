<script lang="tsx" setup>
import { ref } from 'vue'

import { useCollaborators } from './store'

import CardItem from './components/Card.vue'
import { useResizeObserver } from '@/composition/useResizeObserver'
import { debounceInFrame } from '@/utils/debounceInFrame'
import { useMasonry } from '@/composition/useMasonry'

/** 数据源 */
const { collaborators } = useCollaborators()
/** 列表容器，宽度随着父容器，用于监听父容器宽度是否改变（但window没改变，如菜单展开） */
const wrapNodeRef = ref<HTMLDivElement>(document.createElement('div'))
/** 列表节点，masonry列表容器 */
const masonryNodeRef = ref<HTMLDivElement>(document.createElement('div'))

const { layout } = useMasonry(masonryNodeRef)

/** 重排 */
const relayoutHandle = debounceInFrame(layout)

/**
 * 监听列表容器
 *
 * @description
 * masonry实例本身有监听window.onResize之类的事件
 * resize时触发过多函数回调跟这个 resizeObserver 没太大关系
 */
useResizeObserver(wrapNodeRef, relayoutHandle)
</script>
<template>
  <!-- collaborator 宽随父容器 -->
  <div class="wrap" ref="wrapNodeRef">
    <!-- collaborator_list 宽随子元素 -->
    <div class="list" ref="masonryNodeRef">
      <card-item
        v-for="item in collaborators"
        :key="item.key"
        class="js-masonry-item"
        :data="item"
        @resize="relayoutHandle"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.wrap {
  box-sizing: border-box;
}
.list {
  position: relative;
}
.js-masonry-item {
  position: absolute;
}
</style>
