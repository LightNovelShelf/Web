<template>
  <q-grid cols="8" x-gap="20" y-gap="20" @dragover="dragOverHandle">
    <template v-for="item in books" :key="item.value.Id">
      <q-grid-item class="js-drag-item" draggable="true" @dragstart="dragSrartHandle" :data-id="item.value.Id">
        <book-card :book="item.value" />
      </q-grid-item>
    </template>
  </q-grid>
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard.vue'
import { computed, defineComponent, onMounted, ref } from 'vue'
import * as ShelfTypes from '@/types/shelf'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard })

const loading = ref(true)
const books = ref<ShelfTypes.SheldItem[]>([])
/** 依据id索引的books */
const booksMapInId = computed<Map<string, ShelfTypes.SheldItem>>(() => {
  const result = new Map<string, ShelfTypes.SheldItem>()
  books.value.forEach((item) => {
    result.set(item.value.Id + '', item)
  })
  return result
})

const toString = Object.prototype.toString
const isElement = (element: any): boolean => {
  const type = toString.call(element)

  return type.includes('HTML') && type.includes('Element')
}

const findDragableParent = (evt: DragEvent): HTMLElement | undefined => {
  const paths = evt.composedPath()
  return (paths as HTMLElement[]).find((el) => {
    if (!isElement(el)) {
      return false
    }
    return (el as HTMLElement).className.includes('js-drag-item')
  })
}

interface ElInfo {
  sourceX: number
  sourceY: number
  centerX: number
  centerY: number
  width: number
  height: number
  el: HTMLElement
  item: () => ShelfTypes.SheldItem
}

const getShelfIdFromEl = (el: HTMLElement): string => {
  return el.dataset.id!
}

/** 根据事件计算drag元素目前的位置（被鼠标拖着的位置） */
let getDragEleInfo: (evt: DragEvent) => ElInfo
/** 计算元素相关位置 */
const getElementInfo = (el: HTMLElement): ElInfo => {
  const rect = el.getBoundingClientRect()
  return {
    sourceX: rect.x,
    sourceY: rect.y,
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
    width: rect.width,
    height: rect.height,
    el,
    // 一定要函数
    item: () => booksMapInId.value.get(getShelfIdFromEl(el))!
  }
}

const diff = (x1: number, x2: number) => Math.abs(x1 - x2)

/** 这个位置是否表示要交换 */
const shouldSort = (drag: ElInfo, drop: ElInfo): boolean => {
  const dragIndex = drag.item().index
  const dropIndex = drop.item().index
  let diffCenterX = drag.centerX - drop.centerX
  let diffCenterY = drag.centerY - drop.centerY

  // 书籍往小的方向移动; 不能用绝对值，diffCenter 的符号是有意义的
  if (dragIndex > dropIndex) {
    diffCenterX = -diffCenterX
    diffCenterY = -diffCenterY
  }

  // 同一行
  if (diff(drag.sourceY, drop.sourceY) < 10) {
    return diffCenterX > drop.width * 0
  } else {
    // 不同行，Y轴或者X轴 满足条件都可以动
    return diffCenterX > drop.width * 0 || diffCenterY > drop.height * 0
  }
}

const dragSrartHandle = (startEvent: DragEvent) => {
  const dragSource = findDragableParent(startEvent)

  if (!dragSource) {
    return
  }

  const dragElInfo = getElementInfo(dragSource)

  getDragEleInfo = (overEvent: DragEvent): ElInfo => {
    return {
      ...dragElInfo,
      centerX: dragElInfo.centerX + (overEvent.x - startEvent.x),
      centerY: dragElInfo.centerY + (overEvent.y - startEvent.y)
    }
  }
}

const dragOverHandle = (evt: DragEvent) => {
  evt.preventDefault()
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'move'
  }

  const dragInfo = getDragEleInfo(evt)
  const dropEl = findDragableParent(evt)
  // 不是在自己上边移动
  if (dropEl && dropEl !== dragInfo.el) {
    const dropInfo = getElementInfo(dropEl)

    if (shouldSort(dragInfo, dropInfo)) {
      sortHandle(dragInfo, dropInfo)
    } else {
      groupHandle()
    }
  }
}

/** 排序 */
const sortHandle = (dragInfo: ElInfo, dropInfo: ElInfo) => {
  const [drag, drop] = [dragInfo.item(), dropInfo.item()]
  const [{ index: dragIndex }, { index: dropIndex }] = [drag, drop]

  const maxIndex = Math.max(dropIndex, dragIndex)
  const minIndex = Math.min(dropIndex, dragIndex)

  books.value.forEach((item) => {
    if (item.index > maxIndex || item.index < minIndex) {
      return
    }

    // 被拖走的直接换成目标index
    if (item.index === dragIndex) {
      item.index = dropIndex
      return
    }

    // 书籍右移，两者夹着的（包括drop下去的那一项）左移
    if (dragIndex < dropIndex) {
      item.index -= 1
    } else {
      // 书籍左移，两者夹着的（包括drop下去的那一项）右移
      item.index += 1
    }
  })

  sortBooks()

  // from.index = toIndex
}

/** 分组 */
const groupHandle = () => {
  console.log('groupHandle')
}

/** 添加到分组 */
const addToGroupHandle = () => {
  //
}

/** 取消排序 */
const resetHandle = () => {
  //
}

/** 排序书籍数组 */
const sortBooks = () => {
  books.value.sort((a, b) => a.index - b.index)
}

onMounted(() => {
  // 全量读取列表
  shelfDB.getItems<ShelfTypes.SheldItem>().then((res) => {
    books.value = res
    sortBooks()
    loading.value = false
  })
})
</script>

<style lang="scss" scoped>
:deep {
  .gu-transit {
    opacity: 0.6;
  }
}
</style>
