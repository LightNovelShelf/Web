<template>
  <!-- 编辑模式下的确认按钮等 -->
  <q-slide-transition>
    <div v-show="editMode">
      <div class="actions-wrap">
        <q-btn color="primary" outline @click="quiteEditMode">取消</q-btn>
        <q-btn color="primary" @click="saveListChange">保存</q-btn>
      </div>

      <!-- 用 padding/margin 实现会导致过渡效果不顺滑，所以这里绕弯用空div了 -->
      <div style="height: 20px" />
    </div>
  </q-slide-transition>

  <!-- 书籍列表 -->
  <!-- key要写个1和2是告诉vue不能复用这个div，复用了就会导致sortjs清理有问题 -->
  <!-- @todo 缺点是会导致整个列表闪一下，这个看有没有办法处理（看起来是loading的原因） -->
  <q-grid
    :key="editMode ? 1 : 2"
    cols="8"
    x-gap="20"
    y-gap="20"
    :forward-ref="setListWrapRef"
    @contextmenu="rightClickHandle"
  >
    <q-grid-item v-for="item in books" :key="item.value.Id">
      <book-card :book="item.value" :title="item.index" />
    </q-grid-item>
  </q-grid>

  <!-- 右键菜单 -->
  <vue3-menus :open="isOpen" :event="mouseEvent" :menus="menus" />
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard.vue'
import { defineComponent, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue'
import * as ShelfTypes from '@/types/shelf'
import { useForwardRef } from '@/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from '@/utils/safeCall'
import { useQuasar } from 'quasar'
import produce, { setAutoFreeze } from 'immer'
import { Vue3Menus, useContextMenu } from '@/composition/useContextMenu'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard, Vue3Menus })

/** auto freeze的话会导致vue绑定报错 */
setAutoFreeze(false)

const $ = useQuasar()
/** 加载标记 */
const loading = ref(true)
/** 编辑状态 */
const editMode = ref(false)
/** 所有书籍 */
const books = ref<ShelfTypes.SheldItem[]>([])
/** 编辑期间的书籍列表 @immutable */
let draftBooks: ShelfTypes.SheldItem[] = []

/** 排序列表容器 */
const [listWrapRef, setListWrapRef] = useForwardRef()
/** 排序操作句柄 */
const sortableRef = ref<Sortable | null>(null)
/** 清理排序句柄 */
const destorySortable = () => {
  safeCall(() => sortableRef.value?.destroy())
}
const enterEditMode = () => {
  // 避免 draftBooks 数组里对象有 reactive hook
  draftBooks = toRaw(books.value)
  editMode.value = true
}
const quiteEditMode = () => {
  draftBooks = []
  editMode.value = false
}

const { isOpen, mouseEvent, menus, actions } = useContextMenu([
  {
    label: '编辑列表',
    click() {
      enterEditMode()
    }
  }
])

/** 列表右键事件 */
function rightClickHandle(evt: MouseEvent) {
  evt.preventDefault()

  if (editMode.value) {
    return
  }

  actions.open(evt)
}

/** 同步排序结果到临时对象 */
const syncSortInfoToDraft = (sortInfo: { oldIndex?: number; newIndex?: number }) => {
  if (sortInfo.newIndex === undefined || sortInfo.oldIndex === undefined) {
    // 虽然不知道什么情况没这个index，但既然人家标注了这个可能，那就过滤一次
    $.notify({ type: 'warning', message: '排序字段缺失，本次排序操作无效' })
    return
  }

  const { oldIndex, newIndex } = sortInfo
  const maxIndex = Math.max(oldIndex, newIndex)
  const minIndex = Math.min(oldIndex, newIndex)

  // 因为对象是同一个，这里需要用immer隔离这个改动；不然改动会反馈到books里
  draftBooks = produce(draftBooks, (draft) => {
    // 不在范围内的书就不用动了
    // 老的index换成新的index
    // 剩下的依次左移/右移
    draft.forEach((item) => {
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

      // // books变动时就把新的books写入DB
      // shelfDB.set(item.value.Id + '', item)
    })
  })
}

/** 确认列表修改结果 */
const saveListChange = async () => {
  /** 保存修改 */
  books.value = draftBooks

  /** 交换后的书籍数组并不是按照index从小到大排好的，需要手动排一次 */
  sortBooksToAsc()

  /** 写入本地缓存 */
  for (const item of books.value) {
    await shelfDB.set(item.value.Id + '', item)
  }
  /** 退出编辑模式 */
  quiteEditMode()
}

/** 创建排序句柄 */
const createSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, {
    animation: 200,
    onEnd(evt) {
      const { oldIndex, newIndex } = evt
      syncSortInfoToDraft({ oldIndex, newIndex })
    }
  })
}

// 监控组件挂载情况，挂载了就初始化拖动排序
watch([listWrapRef, editMode], ([el, mode]) => {
  destorySortable()

  if (el && mode) {
    createSortable(el)
  }
})

/** 按照index排序书籍数组，因为indexedDB读出来的书籍是按照DB key排序的，没法更改 */
const sortBooksToAsc = () => {
  books.value.sort((a, b) => (a.index > b.index ? 1 : -1))
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
.actions-wrap {
  display: flex;

  :deep(button) {
    margin-left: 10px;
  }

  :deep(button:first-of-type) {
    margin-left: auto;
  }
}
</style>
