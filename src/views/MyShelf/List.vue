<template>
  <!-- 编辑模式下的确认按钮等 -->
  <q-slide-transition>
    <div v-show="editMode">
      <div class="actions-wrap">
        <q-btn
          class="action"
          color="primary"
          @click="toggleShelfFolderSelector"
          :outline="selectedCount === 0"
          :disable="selectedCount === 0"
          >加入文件夹</q-btn
        >
        <q-btn class="action" color="primary" outline @click="selectAllHandle">{{
          isSelectedAll ? '取消全选' : '全选'
        }}</q-btn>

        <div style="flex-grow: 1" />

        <q-btn class="action" color="primary" outline @click="quiteEditMode">取消</q-btn>
        <q-btn class="action" color="primary" @click="saveListChange">保存</q-btn>
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
    @contextmenu="muteInEditMode"
  >
    <q-grid-item
      v-for="(item, index) in books"
      :key="item.value.Id"
      :data-idx="index"
      :data-item-id="item.value.Id"
      @click.capture="listItemClickHandle"
    >
      <div class="shelf-item-wrap">
        <!-- 书籍 -->
        <book-card v-if="item.type === 'book'" :book="item.value" :title="item.index" />
        <!-- 文件夹 -->
        <div v-else-if="item.type === 'folder'">{{ JSON.stringify(item) }}</div>
        <template v-else />

        <!-- 选中态icon -->
        <div v-if="editMode" class="shelf-item-check-icon">
          <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
          <q-icon v-if="item.selected" size="24" color="primary" :name="mdiCheckCircle" />
          <q-icon v-else size="24" color="grey" :name="mdiCheckboxBlankCircleOutline" />
        </div>
        <template v-else />
      </div>
    </q-grid-item>

    <!-- 右键菜单 -->
    <q-menu v-if="!editMode" touch-position context-menu>
      <q-list dense style="min-width: 100px">
        <q-item clickable v-close-popup @click="enterEditMode">
          <q-item-section>编辑列表</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-grid>

  <!-- @todo 书架文件夹选择弹层 -->
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { shelfDB } from '@/utils/storage/db'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard.vue'
import { computed, defineComponent, onBeforeUnmount, onMounted, Ref, ref, toRaw, watch } from 'vue'
import * as ShelfTypes from '@/types/shelf'
import { useForwardRef } from '@/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from '@/utils/safeCall'
import { useQuasar } from 'quasar'
import produce, { setAutoFreeze } from 'immer'
import { mdiCheckCircle, mdiCheckboxBlankCircleOutline } from '@/plugins/icon/export'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard })

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

/** 选中计数 */
const selectedCount: Ref<number> = computed(() => books.value.filter((_) => _.selected).length)
const isSelectedAll: Ref<boolean> = computed(() => selectedCount.value === books.value.length)
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

/** 右键菜单封装 */
function muteInEditMode(evt: MouseEvent) {
  if (editMode.value) {
    evt.preventDefault()
    // 不stop的话无法阻止menu组件弹出
    evt.stopPropagation()
  }
}

/** 列表项目点击 */
function listItemClickHandle(evt: MouseEvent) {
  if (editMode.value) {
    evt.preventDefault()
    evt.stopPropagation()

    const idx = (evt.currentTarget as HTMLElement).dataset.idx as string

    const curSelected = books.value[+idx].selected
    books.value[+idx].selected = !curSelected
    if (curSelected) {
      selectedCount.value -= 1
    } else {
      selectedCount.value += 1
    }
  }
}

/** 全选/取消全选 */
function selectAllHandle() {
  const nextSelected = !isSelectedAll.value
  books.value.forEach((_) => (_.selected = nextSelected))
}
/** 弹出书架文件夹选择弹层 */
function toggleShelfFolderSelector() {
  /** @todo */
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
// 顶部操作栏
.actions-wrap {
  display: flex;

  .action {
    margin-left: 10px;
  }
}

// 列表项
.shelf-item-wrap {
  position: relative;
}
// 列表项选中icon
.shelf-item-check-icon {
  // icon大小， 跟q-icon组件的size值同步
  $icon-size: 24px;

  position: absolute;
  top: 0;
  right: 0;

  font-size: 0;
  line-height: 0;

  // 50/50 的话有点太偏离了
  transform: translate(40%, -50%);
  background-color: #fff;
  border-radius: 100%;

  // 这里解释一下这个18、20、2、24、4、1怎么来
  // 因为圆圈的icon是空心的，所以这里的需要套一个div做背景色
  // 因为icon不是顶格绘制的，所以这里按照svg的viewBox和path的直径来做比例缩放
  // icon的viewBox是24，绘制的直径是20（M12 20）
  // 18则是icon的整体大小
  // 2的来源是圆的border-width是1，border有2
  width: $icon-size * ((20 - 2) / 24);
  height: $icon-size * ((20 - 2) / 24);

  :deep(svg) {
    // 4的来源就很简单了，24减去直径
    // 因为位移只需要关心一个方向的边，所以减1就够了
    transform: translate(-$icon-size * ((4 - 1) / 24), -$icon-size * ((4 - 1) / 24));
  }
}
</style>
