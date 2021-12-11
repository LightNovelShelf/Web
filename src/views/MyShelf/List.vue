<template>
  <q-grid cols="8" x-gap="8" y-gap="8" @dragover="dragOverHandle">
    <template v-for="item in books" :key="item.value.Id">
      <q-grid-item class="js-drag-item" draggable="true" @dragstart="dragSrartHandle">
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
import { defineComponent, onMounted, ref, watch } from 'vue'
import * as ShelfTypes from '@/types/shelf'
// import Sortable from 'sortablejs'
// import dragula from 'dragula'
import { useForwardRef } from '@/utils/useForwardRef'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard })

const loading = ref(true)
const books = ref<ShelfTypes.SheldItem[]>([])

const toString = Object.prototype.toString
const isElement = (element: any): boolean => {
  const type = toString.call(element)

  return type.includes('HTML') && type.includes('Element')
}

const findDragSource = (path: EventTarget[]) => {
  return path.find((el) => {
    if (!isElement(el)) {
      return false
    }
    return (el as HTMLElement).className.includes('js-drag-item')
  })
}

interface ElPositon {
  sourceX: number
  sourceY: number
  centerX: number
  centerY: number
  width: number
  height: number
}

let dragSource: HTMLElement
// let dragStartAt = { x: 0, y: 0 }
// let dragSourceCenter = { x: 0, y: 0 }
let getCurrentDragElePosition = (evt: DragEvent): ElPositon => {
  return { sourceX: 0, sourceY: 0, centerX: 0, centerY: 0, width: 0, height: 0 }
}
const getElementPostion = (el: HTMLElement): ElPositon => {
  const rect = el.getBoundingClientRect()
  return {
    sourceX: rect.x,
    sourceY: rect.y,
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
    width: rect.width,
    height: rect.height
  }
}

const diff = (x1: number, x2: number) => Math.abs(x1 - x2)

const shouldMove = (drag: ElPositon, drop: ElPositon): boolean => {
  // 同一行
  if (diff(drag.sourceY, drop.sourceY) < 10) {
    return drag.centerX - drop.centerX > drop.width * 0
  } else {
    // 不同行，Y轴或者X轴 满足条件都可以动
    return drag.centerX - drop.centerX > drop.width * 0 || drag.centerY - drop.centerY > drop.height * 0
  }
}

const dragSrartHandle = (evt: DragEvent) => {
  dragSource = evt.target as HTMLElement
  const dragStartAt = { x: evt.x, y: evt.y }
  const dragSourceCenter = getElementPostion(dragSource)

  getCurrentDragElePosition = (evt: DragEvent): ElPositon => {
    return {
      sourceX: dragSourceCenter.sourceX,
      sourceY: dragSourceCenter.sourceY,
      centerX: dragSourceCenter.centerX + (evt.x - dragStartAt.x),
      centerY: dragSourceCenter.centerY + (evt.y - dragStartAt.y),
      width: dragSourceCenter.width,
      height: dragSourceCenter.height
    }
  }
}

const dragOverHandle = (evt: DragEvent) => {
  evt.preventDefault()
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'move'
  }

  const path = evt.composedPath()
  const target = findDragSource(path) as HTMLElement | undefined
  if (target && target !== dragSource) {
    // const rect = target.getBoundingClientRect()
    // const halfSize = {
    //   width: Math.floor(rect.width / 2),
    //   height: Math.floor(rect.height / 2)
    // }

    const currentDragPosition = getCurrentDragElePosition(evt)
    const targetPosition = getElementPostion(target)

    if (shouldMove(currentDragPosition, targetPosition)) {
      console.log('dragOverHandle')
    }
  }
}

onMounted(() => {
  // 全量读取列表
  shelfDB.getItems<ShelfTypes.SheldItem>().then((res) => {
    books.value = res.sort((a, b) => a.index - b.index)
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
