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
      <!-- 如果有父层文件夹，显示返回卡片 -->
      <q-grid-item v-if="parentFolder" class="no-drop no-drag"><nav-back-to-root-folder /></q-grid-item>

      <!-- 渲染书架列表内容 -->
      <q-grid-item v-for="item in shelf" :key="item.value.Id" :data-id="item.id" @click.capture="listItemClickHandle">
        <!-- 书架项目 -->
        <div class="shelf-item-wrap">
          <!-- 书籍 -->
          <book-card v-if="item.type === ShelfTypes.ShelfItemType.BOOK" :book="item.value" />
          <!-- 文件夹 -->
          <shelf-folder v-else-if="item.type === ShelfTypes.ShelfItemType.FOLDER" :folder="item" />
          <template v-else />

          <!-- 选中态icon -->
          <div v-if="editMode && item.type !== ShelfTypes.ShelfItemType.FOLDER" class="shelf-item-check-icon">
            <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
            <q-icon v-if="item.selected" size="24" color="primary" :name="mdiCheckCircle" />
            <q-icon v-else size="24" color="grey" :name="mdiCheckboxBlankCircleOutline" />
          </div>
          <template v-else />
        </div>

        <!-- 编辑状态下，书架项目有单独右键菜单 -->
        <q-menu v-if="editMode" touch-position context-menu>
          <q-list style="min-width: 100px">
            <!-- 选中提示 -->
            <q-item>
              <!-- @todo 子菜单展示选中的内容并支持在子菜单内取消选中 -->
              <q-item-section v-if="selectedCount > 1 || (selectedCount && !item.selected)"
                >已选中{{ selectedCount }}项</q-item-section
              >
              <!-- 没有选中时展示当前项标题 -->
              <q-item-section v-else
                ><q-tooltip anchor="top middle" self="bottom middle">{{ item.value.Title }}</q-tooltip
                ><div class="max-len-text">{{ item.value.Title }}</div></q-item-section
              >
            </q-item>

            <q-separator />

            <!-- 书籍相关的 -->
            <template v-if="item.type === ShelfTypes.ShelfItemType.BOOK">
              <!-- 有父层文件夹，代表已经在文件夹里了 -->
              <q-item v-if="parentFolder" clickable v-close-popup @click="moveItemToFolderHandle" :data-id="item.id">
                <q-item-section>移动到...</q-item-section>
              </q-item>
              <!-- 否则就是在root层 -->
              <q-item v-else clickable v-close-popup @click="addItemToFolderHandle">
                <q-item-section>加入到...</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="removeItemHandle" :data-id="item.id">
                <q-item-section>移出书架</q-item-section>
              </q-item>
            </template>

            <template v-else-if="item.type === ShelfTypes.ShelfItemType.FOLDER">
              <!-- 文件夹相关的 -->
              <q-item clickable v-close-popup @click="currentFolderToRename = item">
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

    <!-- 列表右键菜单 -->
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
        <div class="text-h6">{{ parentFolder ? '移动' : '加入' }}到...</div>
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
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          label="输入文件夹名称进行筛选或创建"
          @input-value="selectorValue = $event"
          @update:model-value="selectorValue = $event"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ selectorValue ? '没有找到，将新建文件夹' : '请输入文件夹名称' }}
              </q-item-section>
            </q-item>
          </template></q-select
        >
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :disable="!selectorValue"
          :label="
            selectorValue && typeof selectorValue === 'object'
              ? `${parentFolder ? '移动' : '加入'}(${selectedCount})`
              : `${parentFolder ? '创建并移入' : '创建并加入'}(${selectedCount})`
          "
          color="primary"
          v-close-popup
          @click="folderSelectorSubmitHandle"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 书架文件夹重命名弹层 -->
  <rename-dialog v-model="currentFolderToRename" @rename="renameHandle" />
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
import { mdiCheckCircle, mdiCheckboxBlankCircleOutline, mdiFolderOpen } from '@/plugins/icon/export'
import ShelfFolder from './components/ShelfFolder.vue'
import { ShelfBranch, useShelfStore } from '@/store/shelf'
import { useRoute } from 'vue-router'
import RenameDialog from './components/RenameDialog.vue'
import NavBackToRootFolder from './components/NavBackToRootFolder.vue'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard, ShelfFolder })

interface QSelectorOption {
  label: string
  value: string
  disable?: boolean
}

const $ = useQuasar()
/** 加载标记 */
const loading = ref(false)
const shelfStore = useShelfStore()
const editMode = computed(() => shelfStore.branch === ShelfBranch.draft)
const route = useRoute()
/** 是否有父文件夹(可能有多个) */
const parentFolders = computed<string[]>(() => {
  if (route.params.folderID) {
    if (Array.isArray(route.params.folderID)) {
      return route.params.folderID
    }

    return [route.params.folderID]
  }

  return []
})
/** 直接关系的父文件夹 */
const parentFolder = computed<string | null>(() => [...parentFolders.value].pop() ?? null)
const shelf = computed<ShelfTypes.ShelfItem[]>(() => {
  return shelfStore.getShelfByParents(parentFolders.value)
})

/** 文件夹选择弹层 */
const folderSelectorVisible = ref(false)
/** 文件夹选择器model值 */
const selectorValue = ref<string | QSelectorOption | null>(null)
/** 文件夹选项 */
const folderOptions = computed<QSelectorOption[]>(() => {
  return (
    shelfStore.folders
      // 过滤掉自己，移动到自己没有意义
      .filter((i) => i.id !== parentFolder.value)
      .map((i): QSelectorOption => ({ label: i.value.Title, value: i.id }))
      .filter((i) => {
        // 如果 selectorValue 有值 且不是选项值
        if (selectorValue.value && typeof selectorValue.value !== 'object') {
          // 就筛选
          return i.label.includes(selectorValue.value)
        }

        return true
      })
  )
})

/** 右键菜单 - 加入文件夹 */
function addItemToFolderHandle(evt: MouseEvent) {
  if (selectedCount.value === 0) {
    const { id } = (evt.currentTarget as HTMLElement).dataset

    if (id === undefined) {
      return
    }

    shelfStore.selectItem({ id })
  }

  // 打开文件夹弹层
  folderSelectorVisible.value = true
}

/** 右键菜单 - 移出书架 */
function removeItemHandle(evt: MouseEvent) {
  if (selectedCount.value === 0) {
    const { id } = (evt.currentTarget as HTMLElement).dataset

    if (id === undefined) {
      return
    }

    shelfStore.removeFromShelf({ id })
  }
}

/** 右键菜单 - 移动到文件夹 */
function moveItemToFolderHandle(evt: MouseEvent) {
  if (selectedCount.value === 0) {
    const { id } = (evt.currentTarget as HTMLElement).dataset

    if (id === undefined) {
      return
    }

    shelfStore.selectItem({ id })
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
  const bookIds: string[] = shelf.value.filter((i) => !!i.selected).map((i) => i.id)

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

/** 正在重命名的文件夹；置为某一个文件夹时就会触发重命名弹层显示 */
const currentFolderToRename = ref<ShelfTypes.ShelfFolderItem | null>(null)
/** 重命名 */
function renameHandle(name: string, cb: (promise: Promise<unknown> | void) => void) {
  // just for make ts happy
  if (currentFolderToRename.value?.id) {
    cb(shelfStore.renameFolder({ name, id: currentFolderToRename.value.id }))
  }
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
    const { dataset } = evt.currentTarget as HTMLElement
    const { id } = dataset
    if (id === undefined) {
      return
    }

    const item = shelfStore.shelfsMap.get(id)
    if (!item) {
      return
    }

    // 文件夹允许点击进入，跨文件夹选中项目
    if (item.type === ShelfTypes.ShelfItemType.FOLDER) {
      return
    }

    // 是书籍，干掉点击防止跳转到书籍详情

    evt.preventDefault()
    evt.stopPropagation()

    // 选中书籍
    shelfStore.selectItem({ id })
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

  shelfStore.commitSortInfo({ from: oldIndex, to: newIndex, parents: parentFolders.value })
}

/** 保存修改 */
const submitListChange = async () => {
  shelfStore.clearSelected()
  shelfStore.verifyFolderData()
  shelfStore.merge({ to: ShelfBranch.main })
  shelfStore.checkout({ to: ShelfBranch.main })
  await shelfStore.push()
}

/** 创建排序句柄 */
const createSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, {
    animation: 400,
    // 不能拖动 no-drag 元素
    filter: '.no-drag',
    // 不能放在 no-drop 元素上
    onMove(evt) {
      if (evt.related.className.includes('no-drop')) return false

      return true
    },
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

/** 页面销毁之前清掉拖动排序 */
onBeforeUnmount(() => {
  destorySortable()
})

// 页面切走时要退出编辑状态取消修改；不然的话加入书架等操作就被迫在草稿状态下读取进行了
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

.shelf-item-leave-active {
  position: absolute;
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

// 限制长度的文字
.max-len-text {
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
