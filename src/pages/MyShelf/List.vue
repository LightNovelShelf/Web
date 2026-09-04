<template>
  <q-page padding>
    <!-- 编辑模式下的确认按钮等 -->
    <q-slide-transition>
      <div v-show="editMode">
        <!-- 占高度用的div -->
        <div class="actions-wrap-placeholder"></div>
        <!-- 实际展示的block -->
        <div :class="actionBarClass">
          <div style="flex-grow: 1" />
          <q-btn class="action" color="primary" outline @click="exitEditMode">取消</q-btn>
          <q-btn class="action" color="primary" @click="submitListChange">保存</q-btn>
        </div>

        <div style="height: 24px"></div>
      </div>
    </q-slide-transition>

    <!-- 书籍列表 -->
    <template v-if="shelfData.length || parentFolder">
      <q-grid
        :x-gap="12"
        :y-gap="8"
        cols="6"
        xs="3"
        sm="4"
        md="5"
        xl="6"
        lg="6"
        :forward-ref="setListWrapRef"
        @contextmenu="preventListContextMenuHandle"
        :class="editMode ? 'sortable-list-in-edit-mode' : ''"
      >
        <!-- 如果有父层文件夹，显示返回卡片 -->
        <q-grid-item v-if="parentFolder" class="no-drop no-drag"><nav-back-to-parent-folder /></q-grid-item>

        <!-- 渲染书架列表内容 -->
        <q-grid-item v-for="item in shelfData" :key="item.id" @click.capture="listItemClickHandle(item, $event)">
          <!-- 书架项目 -->
          <div class="shelf-item-wrap">
            <shelf-card :item="item" />

            <!-- 遮罩 -->
            <div v-if="editMode" class="shelf-item-mask">
              <q-responsive :ratio="2 / 3">
                <!-- responsive强制要求第一层子元素宽高100%撑满，起不到缩小拖拽区域的作用 -->
                <div>
                  <!-- 拖拽icon -->
                  <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
                  <q-icon
                    size="40px"
                    color="primary"
                    name="mdiDragVariant"
                    class="shelf-item-dnd-icon js-drag-target"
                  />
                </div>
              </q-responsive>
            </div>

            <!-- 选中态icon -->
            <div v-if="editMode && item.type !== ShelfTypes.ShelfItemTypeEnum.FOLDER" class="shelf-item-check-icon">
              <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
              <q-icon v-if="selected.has(item.id)" size="24px" color="primary" name="mdiCheckCircle" />
              <q-icon v-else size="24px" color="grey" name="mdiCheckboxBlankCircleOutline" />
            </div>

            <template v-else />
          </div>

          <!-- 编辑状态下，书架项目有单独右键菜单 -->
          <q-menu v-if="editMode" touch-position context-menu @before-show="prepareBookContextDataHandle(item)">
            <q-list style="min-width: 100px">
              <!-- 选中提示 -->
              <q-item>
                <!-- @todo 子菜单展示选中的内容并支持在子菜单内取消选中 -->
                <q-item-section v-if="selectedCount > 1 || (selectedCount && selected.has(item.id))"
                  >已选中{{ selectedCount }}项</q-item-section
                >
                <!-- 没有选中时展示当前项标题 -->
                <q-item-section v-else
                  ><q-tooltip anchor="top middle" self="bottom middle" max-width="10em" :delay="200">{{
                    contextMenuShelfItemTitle
                  }}</q-tooltip>
                  <div class="max-len-text">{{ contextMenuShelfItemTitle }}</div>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- 书籍相关的 -->
              <template v-if="item.type === ShelfTypes.ShelfItemTypeEnum.BOOK">
                <!-- 有父层文件夹，代表已经在文件夹里了 -->
                <q-item v-if="parentFolder" clickable v-close-popup @click="openFolderPicker(item)">
                  <q-item-section>移动到...</q-item-section>
                </q-item>
                <!-- 否则就是在root层 -->
                <q-item v-else clickable v-close-popup @click="openFolderPicker(item)">
                  <q-item-section>加入到...</q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="removeItemHandle(item)">
                  <q-item-section>移出书架</q-item-section>
                </q-item>
              </template>

              <template v-else-if="item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER">
                <!-- 文件夹相关的 -->
                <q-item clickable v-close-popup @click="currentFolderToRename = item">
                  <q-item-section>重命名</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="removeFolderHandle(item)">
                  <q-item-section title="文件夹内书籍会放回书架顶层">删除文件夹</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-grid-item>

        <!-- 列表右键菜单 -->
        <q-menu v-if="!editMode" touch-position context-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="enterEditMode">
              <q-item-section>编辑</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-grid>
    </template>

    <!-- 空态; 初始化之后才展示空态，防止初始化就看到空态，然后一闪消失 -->
    <div v-else-if="initialized" class="empty-placeholder">
      <div>
        <q-icon class="empty-placeholder-icon" size="160px" color="grey" name="mdiFolderOpen" />
        <div class="empty-placeholder-label">{{ loading ? '读取中...' : '空空如也' }}</div>
      </div>
    </div>

    <template v-else />

    <shelf-folder-picker
      v-model="folderSelectorVisible"
      :folders="shelfStore.folders"
      :parent-folder="parentFolder"
      :selected-count="selectedCount"
      @submit="moveSelectionToFolder"
    />

    <!-- 书架文件夹重命名弹层 -->
    <rename-dialog v-model="currentFolderToRename" @rename="renameHandle" />
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import { computed, onDeactivated, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getErrMsg } from '@/utils/getErrMsg'
import { useForwardRef } from '@/utils/useForwardRef'

import { useBookListStore } from '@/stores/bookListData'
import { ShelfBranch, useShelfStore } from '@/stores/shelf'

import { useLayout } from '@/components/app/useLayout'
import { QGrid, QGridItem } from '@/components/grid'

import { useShelfSortable } from '@/composition/shelf/useShelfSortable'
import { useIsActivated } from '@/composition/useIsActivated'

import { isRealtimeConnected } from '@/services/transport'
import { ROOT_LEVEL_FOLDER_NAME } from '@/types/shelf'
import * as ShelfTypes from '@/types/shelf'

import NavBackToParentFolder from './components/NavBackToParentFolder.vue'
import RenameDialog from './components/RenameDialog.vue'
import ShelfCard from './components/ShelfCard.vue'
import ShelfFolderPicker from './components/ShelfFolderPicker.vue'

import type { BookInList } from '@/services/book/types'
import type { ShelfFolderDestination } from '@/types/shelf'
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

const $q = useQuasar()
const { headerOffset } = useLayout()
const shelfStore = useShelfStore()
const bookListStore = useBookListStore()
const route = useRoute()
const router = useRouter()
const isActivated = useIsActivated()

const headerHeight = computed(() => `${headerOffset.value}px`)
const loading = computed(() => shelfStore.useLoading().value || !isRealtimeConnected.value)
const selected = computed(() => shelfStore.selected)
const selectedCount = computed(() => shelfStore.selectedCount)
const initialized = computed(() => shelfStore.initialized)
const editMode = computed(() => shelfStore.branch === ShelfBranch.draft)
const folderSelectorVisible = ref(false)
const contextMenuShelfItemID = ref<number | string>(-1)
const currentFolderToRename = ref<ShelfTypes.ShelfFolderItem | null>(null)
const [listWrapRef, setListWrapRef] = useForwardRef()

const parentFolders = ref<string[]>(getParentFolders(route))
const parentFolder = computed(() => parentFolders.value.at(-1) ?? null)
const hasParentFolder = computed(() => parentFolder.value !== null)
const shelfData = computed(() => shelfStore.getItemsByParents(parentFolders.value))
const actionBarClass = computed(() => [
  'actions-wrap',
  { 'actions-wrap-visible': editMode.value },
  $q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1',
])

const contextMenuShelfItem = computed<ShelfTypes.ShelfFolderItem | BookInList | null>(() => {
  const id = contextMenuShelfItemID.value
  if (!id || Number(id) < 0) return null

  const shelfItem = shelfStore.shelfInMap.get(id)
  if (!shelfItem) return null
  return shelfItem.type === ShelfTypes.ShelfItemTypeEnum.BOOK ? bookListStore.getBook(shelfItem.id) : shelfItem
})
const contextMenuShelfItemTitle = computed(() => {
  if (selected.value.size) return `已选${selected.value.size}项`
  if (!contextMenuShelfItem.value) return '未知项目'
  return 'type' in contextMenuShelfItem.value ? contextMenuShelfItem.value.title : contextMenuShelfItem.value.Title
})

function getParentFolders(currentRoute: RouteLocationNormalizedLoaded): string[] {
  const folderId = currentRoute.params.folderID
  if (!folderId) return []
  return Array.isArray(folderId) ? folderId.filter(Boolean) : [folderId]
}

function openFolderPicker(item: ShelfTypes.ShelfItem) {
  if (selectedCount.value === 0) shelfStore.selectItem({ id: item.id })
  folderSelectorVisible.value = true
}

async function moveSelectionToFolder(destination: ShelfFolderDestination) {
  if (!selected.value.size) {
    $q.notify({ type: 'warning', message: '请先选择要移动的项目' })
    return
  }

  let parents: string[]
  if (destination.kind === 'new') {
    const folderId = shelfStore.createFolder({ name: destination.name })
    if (!folderId) return
    parents = [folderId]
  } else {
    parents = destination.parents
  }

  shelfStore.addToFolder({ parents })
  await removeFolderIfEmpty()
}

async function removeItemHandle(item: ShelfTypes.ShelfItem) {
  const books = selectedCount.value === 0 ? [item.id] : shelfStore.selectedBooks.map((selectedBook) => selectedBook.id)
  await shelfStore.removeFromShelf({ books, push: false })
  await removeFolderIfEmpty()
}

async function removeFolderIfEmpty() {
  const folderId = parentFolder.value
  if (!folderId || shelfData.value.length > 0) return
  if (!(await confirmDialog('删除文件夹', '该文件夹为空，是否删除文件夹？'))) return

  shelfStore.deleteFolder({ id: folderId })
  await router.replace({
    ...route,
    params: { folderID: parentFolders.value.filter((id) => id !== folderId) },
  } as RouteLocationRaw)
}

async function removeFolderHandle(item: ShelfTypes.ShelfFolderItem) {
  const children = shelfStore.getItemsByParent(item.id)
  if (
    children.length > 0 &&
    !(await confirmDialog('删除文件夹', `该文件夹不为空，删除后内容会转移到${ROOT_LEVEL_FOLDER_NAME}`))
  ) {
    return
  }
  shelfStore.deleteFolder({ id: item.id })
}

function confirmDialog(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    let confirmed = false
    $q.dialog({ title, message, cancel: true })
      .onOk(() => {
        confirmed = true
      })
      .onDismiss(() => resolve(confirmed))
  })
}

function enterEditMode() {
  shelfStore.checkout({ to: ShelfBranch.draft, reset: true })
  bookListStore.queryBooks({ ids: shelfStore.books.map((book) => book.id) })
}

function exitEditMode() {
  shelfStore.clearSelected()
  shelfStore.checkout({ to: ShelfBranch.main })
}

function renameHandle(name: string, done: (promise: Promise<unknown> | void) => void) {
  if (!currentFolderToRename.value) return
  done(shelfStore.renameFolder({ name, id: currentFolderToRename.value.id }))
}

function preventListContextMenuHandle(event: MouseEvent) {
  if (!editMode.value) return
  event.preventDefault()
  event.stopPropagation()
}

function listItemClickHandle(item: ShelfTypes.ShelfItem, event: MouseEvent) {
  if (!editMode.value) return
  if (item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER) {
    void router.push({ ...route, params: { folderID: item.id } } as RouteLocationRaw)
    return
  }

  event.preventDefault()
  event.stopPropagation()
  shelfStore.selectItem({ id: item.id })
}

function prepareBookContextDataHandle(item: ShelfTypes.ShelfItem) {
  contextMenuShelfItemID.value = selected.value.size ? -1 : item.id
}

async function submitListChange() {
  try {
    await shelfStore.submitChange()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrMsg(error) })
  }
}

useShelfSortable({
  element: listWrapRef,
  enabled: editMode,
  hasParentFolder,
  onMove: ({ from, to }) => shelfStore.commitSortInfo({ from, to, parents: parentFolders.value }),
  onInvalid: () => $q.notify({ type: 'warning', message: '排序字段缺失，本次排序操作无效' }),
})

watch(
  () => [route.params.folderID, isActivated.value] as const,
  ([, active]) => {
    if (active) parentFolders.value = getParentFolders(route)
  },
  { immediate: true, deep: true },
)

onDeactivated(exitEditMode)
</script>

<style lang="scss" scoped>
// 顶部操作栏
.actions-wrap-placeholder {
  height: 48.1px;
}

.actions-wrap {
  display: flex;
  position: fixed;
  z-index: 1;
  padding-bottom: 12px;
  height: 0;

  // top: 12px + 58px;
  top: v-bind(headerHeight);
  padding-top: 12px;

  // right: 12px;
  right: 0;
  padding-right: 12px;

  opacity: 0;
  width: 100%;
  box-shadow:
    0 1px 5px rgb(0 0 0 / 20%),
    0 2px 2px rgb(0 0 0 / 14%),
    0 3px 1px -2px rgb(0 0 0 / 12%);
  transition: all var(--animate-duration);

  .action {
    margin-left: 10px;
  }
}

.actions-wrap-visible {
  opacity: 1;
  height: 60px;
}

// 列表
.sortable-list-in-edit-mode {
  user-select: none;
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

.shelf-item-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  // bottom: 0;
  background-color: rgba(#000, 0.4);
  border-radius: 4px;
  cursor: pointer;
}

// // 列表项动画
// .shelf-item-enter-active,
// .shelf-item-enter-move,
// .shelf-item-leave-active {
//   // 移动的动画需要换成flex才能做
//   transition: all var(--q-transition-duration);
//   // transition: all 5s;
// }

// .shelf-item-leave-active {
//   position: absolute;
// }

// .shelf-item-enter-from,
// .shelf-item-leave-to {
//   opacity: 0;
//   transform: scale(0.9) translateY(20%);
// }

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
  width: $icon-size * calc((20 - 2) / 24);
  height: $icon-size * calc((20 - 2) / 24);

  :deep(svg) {
    // 4的来源就很简单了，24减去直径
    // 因为位移只需要关心一个方向的边，所以减1就够了
    transform: translate(-$icon-size * calc((4 - 1) / 24), -$icon-size * calc((4 - 1) / 24));
    // ff下需要设置这个才有体积
    width: 100%;
    height: 100%;
  }
}

.shelf-item-dnd-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
}

// 限制长度的文字
.max-len-text {
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
