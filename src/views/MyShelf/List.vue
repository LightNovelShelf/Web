<template>
  <!-- 编辑模式下的确认按钮等 -->
  <q-slide-transition>
    <div v-show="editMode">
      <div class="actions-wrap">
        <div style="flex-grow: 1" />
        <q-btn class="action" color="primary" outline @click="quiteEditMode">取消</q-btn>
        <q-btn class="action" color="primary" @click="submitListChange">保存</q-btn>
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
    v-if="shelf.length"
    cols="2"
    xs="2"
    sm="4"
    md="6"
    lg="8"
    xl="10"
    x-gap="20"
    y-gap="20"
    :forward-ref="setListWrapRef"
    @contextmenu="muteInEditMode"
  >
    <transition-group name="shelf-item">
      <q-grid-item
        v-for="(item, index) in shelf"
        :key="item.value.Id"
        :data-idx="index"
        @click.capture="listItemClickHandle"
      >
        <div class="shelf-item-wrap">
          <!-- 书籍 -->
          <book-card v-if="item.type === ShelfTypes.ShelfItemType.BOOK" :book="item.value" :title="item.index" />
          <!-- 文件夹 -->
          <shelf-folder
            v-else-if="item.type === ShelfTypes.ShelfItemType.FOLDER"
            :folder="item.value"
            :title="item.index"
          />
          <template v-else />

          <!-- 选中态icon -->
          <div v-if="editMode && item.type !== ShelfTypes.ShelfItemType.FOLDER" class="shelf-item-check-icon">
            <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
            <q-icon v-if="item.selected" size="24" color="primary" :name="mdiCheckCircle" />
            <q-icon v-else size="24" color="grey" :name="mdiCheckboxBlankCircleOutline" />
          </div>
          <template v-else />
        </div>

        <!-- 编辑状态下，书籍可以有右键菜单 -->
        <q-menu v-if="editMode" touch-position context-menu>
          <q-list dense style="min-width: 100px">
            <!-- 书籍相关的 -->
            <template v-if="item.type === ShelfTypes.ShelfItemType.BOOK">
              <q-item clickable v-close-popup @click="addItemToFolderHandle" :data-idx="item.index">
                <q-item-section>加入到...</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>移出</q-item-section>
              </q-item>
            </template>

            <template v-else-if="item.type === ShelfTypes.ShelfItemType.FOLDER">
              <!-- 文件夹相关的 -->
              <q-item clickable v-close-popup>
                <q-item-section>重命名</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section title="文件夹内书籍会放回书架顶层">删除文件夹</q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-grid-item>
    </transition-group>

    <!-- 右键菜单 -->
    <q-menu v-if="!editMode" touch-position context-menu>
      <q-list dense style="min-width: 100px">
        <q-item clickable v-close-popup @click="enterEditMode">
          <q-item-section>编辑</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-grid>

  <!-- 空态 -->
  <div v-else class="empty-placeholder">
    <div>
      <q-icon class="empty-placeholder-icon" size="160" color="grey" :name="mdiFolderOpen" />
      <div class="empty-placeholder-label">{{ loading ? '读取中...' : '空空如也' }}</div>
    </div>
  </div>

  <!-- 书架文件夹选择弹层 -->
  <q-dialog :model-value="folderSelectorVisible" @update:model-value="toggleShelfFolderSelector">
    <q-card class="shelf-folder-selector-card">
      <q-card-section>
        <div class="text-h6">添加到...</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- 
          一定要监听 update:model-value 事件，需要依赖它来分辨 selectorValue 是筛选值还是选择值；
          不监听的话 selectorValue 就都是字符串
         -->
        <q-select
          filled
          :model-value="selectorValue"
          :options="folderOptions"
          autofocus
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          label="输入文件夹名称"
          @input-value="selectorValue = $event"
          @update:model-value="selectorValue = $event"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 没有找到，将新建文件夹 </q-item-section>
            </q-item>
          </template></q-select
        >
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :disable="!selectorValue"
          :label="selectorValue && typeof selectorValue === 'object' ? '加入' : '创建并加入'"
          color="primary"
          v-close-popup
          @click="folderSelectorSubmitHandle"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import AddToShelf from '@/components/biz/MyShelf/AddToShelf.vue'
import { QGrid, QGridItem } from '@/plugins/quasar/components'
import BookCard from '@/components/BookCard'
import { computed, defineComponent, onBeforeUnmount, onDeactivated, ref, watch } from 'vue'
import * as ShelfTypes from '@/types/shelf'
import { useForwardRef } from '@/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from '@/utils/safeCall'
import { useQuasar } from 'quasar'
import { mdiCheckCircle, mdiCheckboxBlankCircleOutline, mdiFolderOpen, mdiChevronRight } from '@/plugins/icon/export'
import { nanoid } from 'nanoid'
import ShelfFolder from './components/ShelfFolder.vue'
import { ShelfBranch, useShelfStore } from '@/store/shelf'
import { useRoute } from 'vue-router'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard, ShelfFolder })

interface QSelectorOption {
  label: string
  value: string
}

const $ = useQuasar()
/** 加载标记 */
const loading = ref(false)
const shelfStore = useShelfStore()
const editMode = computed(() => shelfStore.branch === ShelfBranch.draft)
const { params } = useRoute()
const shelf = computed(() => {
  if (typeof params.folderID === 'string') {
    return shelfStore.getShelfByParents([params.folderID])
  } else {
    return shelfStore.getShelfByParents(params.folderID)
  }
})

/** 临时变量：用于处理右键菜单中的单个 加入到 选项 */
let tempSelectedItemIndex: number[] = []

/** 书架文件夹列表 */
const folders = computed<ShelfTypes.ShelfFolderItem[]>(() =>
  shelf.value.filter((i): i is ShelfTypes.ShelfFolderItem => i.type === ShelfTypes.ShelfItemType.FOLDER)
)

/** 文件夹选择弹层 */
const folderSelectorVisible = ref(false)
/** 文件夹选择器model值 */
const selectorValue = ref<string | QSelectorOption | null>(null)
/** 文件夹选项 */
const folderOptions = computed<QSelectorOption[]>(() =>
  folders.value
    .map((i) => ({ label: i.value.Title, value: i.value.Id + '' }))
    .filter((i) => {
      // 如果 selectorValue 有值 且不是选项值
      if (selectorValue.value && typeof selectorValue.value !== 'object') {
        // 就筛选
        return i.label.includes(selectorValue.value)
      }

      return true
    })
)

/** 右键菜单 - 加入文件夹 */
function addItemToFolderHandle(evt: MouseEvent) {
  if (selectedCount.value === 0) {
    const index = (evt.currentTarget as HTMLElement).dataset.idx

    // 不是有效整数
    if (!Number.isInteger(Number(index))) {
      // 退出
      return
    }

    shelfStore.selectItem({ index: Number(index) })
  }

  // 打开文件夹弹层
  folderSelectorVisible.value = true
}

/** 文件夹选择器提交 */
function folderSelectorSubmitHandle() {
  if (!selectorValue.value) {
    return
  }

  /** 要更改的书籍 */
  const bookIds: string[] = (
    tempSelectedItemIndex.length // 如果有临时记录的index数组，代表是在有选中的情况下点右键加入单个到文件夹，优先使用这个变量
      ? tempSelectedItemIndex.map((i) => shelf.value[i]).filter((i) => !!i)
      : shelf.value.filter((i) => !!i.selected)
  ).map((i) => i.id)

  // 保险逻辑，没有children的化就不走下边的各种创建、修改逻辑了，保持原样
  if (!bookIds.length) {
    // 弹个toast
    $.notify({ type: 'warning', message: '请先选择要加入文件夹的项目' })
    return
  }

  let folderID = ''

  /** 需要创建文件夹：值是字符串而不是option */
  if (typeof selectorValue.value === 'string') {
    folderID = shelfStore.createFolder({ name: selectorValue.value })
  } else {
    folderID = selectorValue.value.value
  }

  // 创建文件夹失败（重名、数据错误等 ）会返回空folderID
  // 选项有问题的时候也可能出现 folderID 为空
  if (folderID) {
    shelfStore.addToFolder({ books: bookIds, folderID })
  }
}

/** 选中计数 */
const selectedCount = computed(() => shelfStore.selectedNum)
/** 是否全选 */
// const isSelectedAll = computed<boolean>(() => selectedCount.value === shelf.value.length)
/** 排序列表容器 */
const [listWrapRef, setListWrapRef] = useForwardRef()
/** 排序操作句柄 */
const sortableRef = ref<Sortable | null>(null)
/** 清理排序句柄 */
const destorySortable = () => {
  safeCall(() => sortableRef.value?.destroy())
}
/** 进入编辑模式 */
const enterEditMode = () => {
  shelfStore.checkout({ to: ShelfBranch.draft, reset: true })
}
/** 退出编辑模式 */
const quiteEditMode = () => {
  shelfStore.clearSelected()
  shelfStore.checkout({ to: ShelfBranch.main })
}

/** 屏蔽编辑模式下的事件 */
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

    const { dataset } = evt.currentTarget as HTMLElement
    const { idx } = dataset
    if (idx === undefined) {
      return
    }

    const shelfItem = shelf.value[+idx]
    if (!shelfItem) {
      return
    }

    /** @todo 先暂时屏蔽文件夹选中功能，文件夹的嵌套需要好好考虑数据交互再实现 */
    if (shelfItem.type === ShelfTypes.ShelfItemType.FOLDER) {
      return
    }

    shelfStore.selectItem({ index: Number(idx) })
  }
}

/** 弹出书架文件夹选择弹层 */
function toggleShelfFolderSelector() {
  folderSelectorVisible.value = !folderSelectorVisible.value
  // 弹层状态改变时重置 selector 状态
  selectorValue.value = ''
}

/** 同步排序结果到draft */
const syncSortInfoToDraft = ({ oldIndex, newIndex }: { oldIndex?: number; newIndex?: number }) => {
  if (newIndex === undefined || oldIndex === undefined) {
    // 虽然不知道什么情况没这个index，但既然人家标注了这个可能，那就过滤一次
    $.notify({ type: 'warning', message: '排序字段缺失，本次排序操作无效' })
    return
  }

  shelfStore.commitSortInfo({ from: oldIndex, to: newIndex })
}

/** 确认列表修改结果 */
const submitListChange = async () => {
  shelfStore.clearSelected()
  shelfStore.merge({ to: ShelfBranch.main })
  shelfStore.checkout({ to: ShelfBranch.main })
  shelfStore.push()
}

/** 创建排序句柄 */
const createSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, {
    animation: 400,
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

onBeforeUnmount(() => {
  destorySortable()
})
onDeactivated(() => {
  quiteEditMode()
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

// 列表空态
.empty-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
}
.empty-placeholder-icon {
  display: block;
}
.empty-placeholder-label {
  margin-top: 4px;
}

// 列表项
.shelf-item-wrap {
  position: relative;
}

// 列表项动画
.shelf-item-enter-active,
.shelf-item-enter-move,
.shelf-item-leave-active {
  // 移动的动画需要换成flex才能做
  transition: all var(--q-transition-duration);
  // transition: all 5s;
}

.shelf-item-enter-from,
.shelf-item-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20%);
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
    // ff下需要设置这个才有体积
    width: 100%;
    height: 100%;
  }
}

// 文件夹选择弹层 相关
.shelf-folder-selector-card {
  min-width: 300px;
}
</style>
