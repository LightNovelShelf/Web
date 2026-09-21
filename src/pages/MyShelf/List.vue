<template>
  <q-page padding>
    <!-- 路径 + 操作栏，滚动时吸附在页头下面 -->
    <div :class="toolbarClass">
      <shelf-breadcrumb class="shelf-toolbar-path" :path="folderPath" />

      <div class="shelf-toolbar-actions">
        <template v-if="editMode">
          <div class="shelf-toolbar-count">已选 {{ selectedCount }} 项</div>
          <q-btn
            flat
            dense
            no-caps
            icon="mdiCheckAll"
            :label="compactActions ? undefined : selectAllLabel"
            :disable="!shelfData.length"
            @click="toggleSelectAllHandle"
          >
            <q-tooltip>{{ selectAllLabel }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            no-caps
            icon="mdiFolderPlusOutline"
            :label="compactActions ? undefined : '新建文件夹'"
            @click="createFolderHandle"
          >
            <q-tooltip>新建文件夹</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            no-caps
            icon="mdiFolderMoveOutline"
            :label="compactActions ? undefined : '移动到...'"
            :disable="!selectedCount"
            @click="openFolderPicker()"
          >
            <q-tooltip>移动到...</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            no-caps
            icon="mdiHeartRemoveOutline"
            :label="compactActions ? undefined : '移出书架'"
            :disable="!selectedCount"
            @click="removeSelectedHandle"
          >
            <q-tooltip>移出书架</q-tooltip>
          </q-btn>
          <q-btn outline dense no-caps color="primary" label="取消" @click="exitEditMode" />
          <q-btn unelevated dense no-caps color="primary" label="保存" :loading="saving" @click="submitListChange" />
        </template>

        <q-btn v-else flat dense no-caps icon="mdiSquareEditOutline" label="整理书架" @click="enterEditMode" />
      </div>
    </div>

    <!-- 书籍列表 -->
    <template v-if="shelfData.length">
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

              <!-- 整理模式下进文件夹的入口，点卡片本身是选中 -->
              <q-btn
                v-if="item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER"
                class="shelf-item-open-btn js-open-folder"
                round
                dense
                size="sm"
                color="primary"
                icon="mdiFolderOpen"
                @click="openFolderHandle(item)"
              >
                <q-tooltip>打开文件夹</q-tooltip>
              </q-btn>
            </div>

            <!-- 选中态icon -->
            <div v-if="editMode" class="shelf-item-check-icon">
              <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
              <q-icon v-if="selected.has(item.id)" size="24px" color="primary" name="mdiCheckCircle" />
              <q-icon v-else size="24px" color="grey" name="mdiCheckboxBlankCircleOutline" />
            </div>
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

              <template v-if="item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER">
                <!-- 文件夹相关的 -->
                <q-item clickable v-close-popup @click="openFolderHandle(item)">
                  <q-item-section>打开</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="currentFolderToRename = item">
                  <q-item-section>重命名</q-item-section>
                </q-item>
              </template>

              <q-item clickable v-close-popup @click="openFolderPicker(item)">
                <q-item-section>移动到...</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="removeItemHandle(item)">
                <q-item-section>移出书架</q-item-section>
              </q-item>

              <q-item
                v-if="item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER"
                clickable
                v-close-popup
                @click="removeFolderHandle(item)"
              >
                <q-item-section :title="`文件夹内的内容会放回${currentFolderTitle}`">删除文件夹</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-grid-item>

        <!-- 列表右键菜单 -->
        <q-menu v-if="!editMode" touch-position context-menu>
          <q-list dense style="min-width: 100px">
            <q-item clickable v-close-popup @click="enterEditMode">
              <q-item-section>整理书架</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="createFolderHandle">
              <q-item-section>新建文件夹</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-grid>
    </template>

    <!-- 空态; 初始化之后才展示空态，防止初始化就看到空态，然后一闪消失 -->
    <div v-else-if="initialized" class="empty-placeholder">
      <div>
        <q-icon class="empty-placeholder-icon" size="160px" color="grey" name="mdiFolderOpen" />
        <div class="empty-placeholder-label">{{ emptyLabel }}</div>
      </div>
    </div>

    <template v-else />

    <!-- 移动到文件夹弹层 -->
    <shelf-folder-picker
      v-model="folderSelectorVisible"
      :moving-ids="movingIds"
      :current-parents="parentFolders"
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
import * as ShelfTypes from '@/types/shelf'

import RenameDialog from './components/RenameDialog.vue'
import ShelfBreadcrumb from './components/ShelfBreadcrumb.vue'
import ShelfCard from './components/ShelfCard.vue'
import ShelfFolderPicker from './components/ShelfFolderPicker.vue'

import type { BookInList } from '@/services/book/types'
import type { ShelfFolderDestination } from '@/types/shelf'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

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
const saving = ref(false)
const contextMenuShelfItemID = ref<number | string>(-1)
const movingIds = ref<(number | string)[]>([])
const currentFolderToRename = ref<ShelfTypes.ShelfFolderItem | null>(null)
const [listWrapRef, setListWrapRef] = useForwardRef()

const parentFolders = ref<string[]>(getParentFolders(route))
/** 当前路径上的文件夹链；路径失效时是null */
const resolvedPath = computed(() => shelfStore.resolveFolderPath(parentFolders.value))
const folderPath = computed(() => resolvedPath.value ?? [])
const parentFolder = computed(() => parentFolders.value.at(-1) ?? null)
const currentFolderTitle = computed(() => folderPath.value.at(-1)?.title ?? '我的书架')
const shelfData = computed(() => shelfStore.getItemsByParents(parentFolders.value))
const allSelected = computed(
  () => shelfData.value.length > 0 && shelfData.value.every((item) => selected.value.has(item.id)),
)
const selectAllLabel = computed(() => (allSelected.value ? '取消全选' : '全选本层'))
// 窄屏放不下六个带文字的按钮，收成纯图标
const compactActions = computed(() => $q.screen.lt.md)
const emptyLabel = computed(() => {
  if (loading.value) return '读取中...'
  return parentFolder.value ? '这个文件夹是空的' : '空空如也'
})
const toolbarClass = computed(() => ['shelf-toolbar', $q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'])

const contextMenuShelfItem = computed<ShelfTypes.ShelfFolderItem | BookInList | null>(() => {
  const id = contextMenuShelfItemID.value
  if (!id || Number(id) < 0) return null

  const shelfItem = shelfStore.shelfInMap.get(id)
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

function navToFolder(parents: string[], replace = false) {
  const location = { name: 'MyShelf' as const, params: { folderID: parents } }
  return replace ? router.replace(location) : router.push(location)
}

function openFolderHandle(item: ShelfTypes.ShelfItem) {
  if (item.type !== ShelfTypes.ShelfItemTypeEnum.FOLDER) return
  void navToFolder([...item.parents, item.id])
}

function openFolderPicker(item?: ShelfTypes.ShelfItem) {
  if (item && !selected.value.has(item.id)) {
    movingIds.value = [item.id]
  } else {
    movingIds.value = [...selected.value]
  }
  if (!movingIds.value.length) {
    $q.notify({ type: 'warning', message: '请先选择要移动的项目' })
    return
  }
  folderSelectorVisible.value = true
}

async function moveSelectionToFolder(destination: ShelfFolderDestination) {
  const ids = movingIds.value
  if (!ids.length) return

  let parents = destination.parents
  if (destination.kind === 'new') {
    const folderId = shelfStore.createFolder({ name: destination.name, parents: destination.parents })
    if (!folderId) return
    parents = [...destination.parents, folderId]
  }

  const moved = shelfStore.moveItems({ ids, parents })
  if (moved) $q.notify({ type: 'positive', timeout: 1200, message: `已移动 ${moved} 项` })
  await removeFolderIfEmpty()
}

function createFolderHandle() {
  const parents = [...parentFolders.value]
  $q.dialog({
    title: '新建文件夹',
    prompt: { model: '', type: 'text', label: '文件夹名称', isValid: (value: string) => !!value.trim() },
    cancel: true,
  }).onOk((name: string) => {
    if (!editMode.value) enterEditMode()
    shelfStore.createFolder({ name, parents })
  })
}

function toggleSelectAllHandle() {
  const nextSelected = !allSelected.value
  for (const item of shelfData.value) {
    shelfStore.selectItem({ id: item.id, selected: nextSelected })
  }
}

async function removeItemHandle(item: ShelfTypes.ShelfItem) {
  const ids = selected.value.has(item.id) ? [...selected.value] : [item.id]
  await removeItems(ids)
}

async function removeSelectedHandle() {
  await removeItems([...selected.value])
}

/** 移出书架；带文件夹时要提示里面的内容会一起移出 */
async function removeItems(ids: (number | string)[]) {
  if (!ids.length) return

  const folderCount = ids.filter((id) => typeof id === 'string').length
  if (
    folderCount &&
    !(await confirmDialog('移出书架', `选中的 ${folderCount} 个文件夹，连同里面的所有内容都会移出书架`))
  ) {
    return
  }

  await shelfStore.removeFromShelf({ books: ids, push: false })
  shelfStore.clearSelected()
  await removeFolderIfEmpty()
}

async function removeFolderIfEmpty() {
  const folderId = parentFolder.value
  if (!folderId || shelfData.value.length > 0) return
  if (!(await confirmDialog('删除文件夹', '该文件夹为空，是否删除文件夹？'))) return

  // 先退到上一层再删；反过来的话当前路径会先失效，失效守卫会把人踢回书架顶层
  await navToFolder(parentFolders.value.slice(0, -1), true)
  shelfStore.deleteFolder({ id: folderId })
}

async function removeFolderHandle(item: ShelfTypes.ShelfFolderItem) {
  const children = shelfStore.getItemsByParents([...item.parents, item.id])
  if (
    children.length > 0 &&
    !(await confirmDialog('删除文件夹', `该文件夹不为空，删除后里面的内容会放回${currentFolderTitle.value}`))
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

function renameHandle(name: string, done: (success: boolean) => void) {
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
  // 打开文件夹的按钮自己处理点击
  if ((event.target as HTMLElement | null)?.closest('.js-open-folder')) return

  event.preventDefault()
  event.stopPropagation()
  shelfStore.selectItem({ id: item.id })
}

function prepareBookContextDataHandle(item: ShelfTypes.ShelfItem) {
  contextMenuShelfItemID.value = selected.value.size ? -1 : item.id
}

async function submitListChange() {
  saving.value = true
  try {
    await shelfStore.submitChange()
    $q.notify({ type: 'positive', timeout: 1200, message: '书架已保存' })
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrMsg(error) })
  } finally {
    saving.value = false
  }
}

useShelfSortable({
  element: listWrapRef,
  enabled: editMode,
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

// 文件夹被删掉之后的旧链接会解析失败，回到书架顶层
watch([resolvedPath, initialized, loading], ([path, ready, busy]) => {
  if (!isActivated.value || !ready || busy || path !== null) return
  $q.notify({ type: 'warning', timeout: 1500, message: '文件夹不存在，已返回书架' })
  void navToFolder([], true)
})

onDeactivated(exitEditMode)
</script>

<style lang="scss" scoped>
// 顶部路径+操作栏
.shelf-toolbar {
  position: sticky;
  z-index: 2;
  top: v-bind(headerHeight);

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  // q-page 自带 16px padding，靠负 margin 让吸顶栏通栏
  margin: -16px -16px 12px;
  padding: 8px 16px;
  min-height: 48px;
}

.shelf-toolbar-path {
  flex-grow: 1;
  min-width: 0;
}

.shelf-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.shelf-toolbar-count {
  font-size: 12px;
  opacity: 0.7;
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
  background-color: rgba(#000, 0.4);
  border-radius: 4px;
  cursor: pointer;
}

// 整理模式下的打开文件夹按钮
.shelf-item-open-btn {
  position: absolute;
  right: 4px;
  bottom: 4px;
  z-index: 1;
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
