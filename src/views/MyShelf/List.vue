<template>
  <q-grid cols="8" x-gap="20" y-gap="20" :forward-ref="setListWrapRef" @contextmenu="rightClick">
    <template v-for="item in books" :key="item.value.Id">
      <q-grid-item class="js-drag-item" draggable="true" :data-id="item.value.Id">
        <book-card :book="item.value" :title="item.index" />
      </q-grid-item>
    </template>
  </q-grid>
  <!-- 右键菜单 -->
  <vue3-menus :open="isOpen" :event="mousrEvent" :menus="menus" />
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard.vue'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import * as ShelfTypes from '@/types/shelf'
import { useForwardRef } from '@/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from '@/utils/safeCall'
import { useQuasar } from 'quasar'
import { Vue3Menus, useContextMenu } from '@/composition/useContextMenu'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard, Vue3Menus })

const $ = useQuasar()
/** 加载标记 */
const loading = ref(true)
/** 所有书籍 */
const books = ref<ShelfTypes.SheldItem[]>([])
/** 排序列表容器 */
const [listWrapRef, setListWrapRef] = useForwardRef()
/** 排序操作句柄 */
const sortableRef = ref<Sortable | null>(null)
/** 清理排序句柄 */
const destorySortable = () => {
  safeCall(() => sortableRef.value?.destroy())
}

const { isOpen, mousrEvent, menus, actions } = useContextMenu([
  {
    label: '返回(B)',
    tip: 'Alt+向左箭头'
  },
  {
    label: '点击不关闭菜单',
    tip: '不关闭菜单',
    click: () => {
      return false
    }
  },
  {
    label: '前进(F)',
    tip: 'Alt+向右箭头',
    disabled: true
  },
  {
    label: '为此页面创建二维码',
    divided: true
  },
  {
    label: '使用网页翻译(F)',
    divided: true,
    children: [
      { label: '翻译成繁体中文' },
      { label: '翻译成繁体中文' },
      {
        label: '百度翻译',
        children: [{ label: '翻译成繁体中文' }, { label: '翻译成繁体中文' }]
      },
      {
        label: '搜狗翻译',
        children: [{ label: '翻译成繁体中文' }, { label: '翻译成繁体中文' }]
      },
      {
        label: '有道翻译',
        children: [{ label: '翻译成繁体中文' }, { label: '翻译成繁体中文' }]
      }
    ]
  }
])

/** 右键事件 */
function rightClick(evt: MouseEvent) {
  // actions.open(evt)
  // evt.preventDefault()
  actions.open(evt, [{ label: '返回(B)', tip: 'Alt+向左箭头' }])
}

/** 把更改排序后的数组写入DB */
const syncSortInfo = (sortInfo: { oldIndex?: number; newIndex?: number }) => {
  if (sortInfo.newIndex === undefined || sortInfo.oldIndex === undefined) {
    // 虽然不知道什么情况没这个index，但既然人家标注了这个可能，那就过滤一次
    $.notify({ type: 'warning', message: '排序字段缺失，本次排序操作无效' })
    return
  }

  const { oldIndex, newIndex } = sortInfo
  const maxIndex = Math.max(oldIndex, newIndex)
  const minIndex = Math.min(oldIndex, newIndex)

  // 不在范围内的书就不用动了
  // 老的index换成新的index
  // 剩下的依次左移/右移动
  books.value.forEach((item) => {
    if (item.index < minIndex || item.index > maxIndex) {
      return
    }

    if (item.index === oldIndex) {
      item.index = newIndex
    } else if (oldIndex === minIndex) {
      // 从小拖到大，左移填充老的那个位置
      item.index -= 1
    } else {
      // 从大拖到小，右移填充老的那个位置
      item.index += 1
    }

    // books变动时就把新的books写入DB
    shelfDB.set(item.value.Id + '', item)
  })

  // 保证数组是按顺序的，虽然现在没什么用，但保持这个一致性可以降低debug压力
  sortBooksToAsc()
}

/** 创建排序句柄 */
const createSSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, {
    animation: 200,
    onEnd(evt) {
      const { oldIndex, newIndex } = evt
      console.log('end', { oldIndex, newIndex })
      syncSortInfo({ oldIndex, newIndex })
    }
  })
}

// 监控组件挂载情况，挂载了就初始化拖动排序
watch(listWrapRef, (el) => {
  destorySortable()
  if (el) {
    createSSortable(el)
  }
})

/** 按照index排序书籍数组，因为indexedDB读出来的书籍是按照DB key排序的，没法更改 */
const sortBooksToAsc = () => {
  books.value.sort((a, b) => a.index - b.index)
}

// 初始化
onMounted(() => {
  // 全量读取列表
  shelfDB.getItems().then((res) => {
    books.value = res
    sortBooksToAsc()
    loading.value = false
  })
})

onBeforeUnmount(() => {
  destorySortable()
})
</script>

<style lang="scss" scoped>
:deep {
  .gu-transit {
    opacity: 0.6;
  }
}
</style>
