<script lang="ts">
export default {
  name: 'CollaboratorList',
}
</script>

<script lang="ts" setup>
import { ref } from 'vue'
import CardItem from './components/Card.vue'
import { useResizeObserver } from 'src/composition/useResizeObserver'
import { debounceInFrame } from 'src/utils/debounceInFrame'
import { useMasonry } from 'src/composition/useMasonry'
import { getCollaboratorList } from 'src/services/context'
import type { Card } from 'src/types/collaborator'

/** 数据源 */
const collaborators = ref<Card[]>([])
const loading = ref(true)
getCollaboratorList().then((res) => {
  collaborators.value = res
  loading.value = false
})
/** 列表容器，宽度随着父容器，用于监听父容器宽度是否改变（但window没改变，如菜单展开） */
const wrapNodeRef = ref<HTMLDivElement>(document.createElement('div'))
/** 列表节点，masonry列表容器 */
const masonryNodeRef = ref<HTMLDivElement>(document.createElement('div'))

const { layout } = useMasonry(masonryNodeRef)

/** 重排 */
const reLayoutHandle = debounceInFrame(layout)

/**
 * 监听列表容器
 *
 * @description
 * masonry实例本身有监听window.onResize之类的事件
 * resize时触发过多函数回调跟这个 resizeObserver 没太大关系
 */
useResizeObserver(wrapNodeRef, reLayoutHandle)
</script>
<template>
  <q-page padding>
    <!-- collaborator 宽随父容器 -->
    <div class="wrap" ref="wrapNodeRef">
      <!-- collaborator_list 宽随子元素 -->
      <div class="list" ref="masonryNodeRef">
        <card-item
          v-for="item in collaborators"
          :key="item.Id"
          class="js-masonry-item"
          :data="item"
          @resize="reLayoutHandle"
        />
      </div>
      <q-inner-loading :showing="loading" label="请等待..." label-class="text-teal" label-style="font-size: 1.1em" />
    </div>
  </q-page>
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
