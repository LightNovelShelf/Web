<template>
  <q-page padding>
    <!-- 编辑模式下的确认按钮等 -->
    <q-slide-transition>
      <div v-show="editMode">
        <!-- 占高度用的div -->
        <div class="actions-wrap-placeholder"></div>
        <!-- 实际展示的block -->
        <div :class="getClass()">
          <div style="flex-grow: 1" />
          <q-btn class="action" color="primary" outline @click="quiteEditMode">取消</q-btn>
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
                    :name="mdiDragVariant"
                    class="shelf-item-dnd-icon js-drag-target"
                  />
                </div>
              </q-responsive>
            </div>

            <!-- 选中态icon -->
            <div v-if="editMode && item.type !== ShelfTypes.ShelfItemTypeEnum.FOLDER" class="shelf-item-check-icon">
              <!-- @todo icon的切换参照多看实现一个回弹缩放动画 -->
              <q-icon v-if="selected.has(item.id)" size="24px" color="primary" :name="mdiCheckCircle" />
              <q-icon v-else size="24px" color="grey" :name="mdiCheckboxBlankCircleOutline" />
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
                  }}</q-tooltip
                  ><div class="max-len-text">{{ contextMenuShelfItemTitle }}</div></q-item-section
                >
              </q-item>

              <q-separator />

              <!-- 书籍相关的 -->
              <template v-if="item.type === ShelfTypes.ShelfItemTypeEnum.BOOK">
                <!-- 有父层文件夹，代表已经在文件夹里了 -->
                <q-item v-if="parentFolder" clickable v-close-popup @click="moveItemToFolderHandle(item)">
                  <q-item-section>移动到...</q-item-section>
                </q-item>
                <!-- 否则就是在root层 -->
                <q-item v-else clickable v-close-popup @click="addItemToFolderHandle(item)">
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
        <q-icon class="empty-placeholder-icon" size="160px" color="grey" :name="mdiFolderOpen" />
        <div class="empty-placeholder-label">{{ loading ? '读取中...' : '空空如也' }}</div>
      </div>
    </div>

    <template v-else />

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
            <!-- 空状态 -->
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{ selectorValue ? '没有找到，将新建文件夹' : '请输入文件夹名称' }}
                </q-item-section>
              </q-item>
            </template>
            <!-- 覆盖渲染模板 -->
            <template v-slot:option="scope">
              <!-- scope.opt 类型是 QSelectorOption -->
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label class="max-len-text">{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>{{ scope.opt.updateAt }}</q-item-section>
              </q-item>
            </template>
          </q-select>
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
  </q-page>
</template>

<script lang="ts" setup>
import { QGrid, QGridItem } from 'src/components/grid'
import { computed, onBeforeUnmount, onDeactivated, ref, toRaw, watch } from 'vue'
import * as ShelfTypes from 'src/types/shelf'
import { useForwardRef } from 'src/utils/useForwardRef'
import Sortable from 'sortablejs'
import { safeCall } from 'src/utils/safeCall'
import { useQuasar } from 'quasar'
import { mdiCheckCircle, mdiCheckboxBlankCircleOutline, mdiFolderOpen, mdiDragVariant } from 'assets/icon/export'
import { ROOT_LEVEL_FOLDER_NAME, ShelfBranch, useShelfStore } from 'stores/shelf'
import { RouteLocationNormalizedLoaded, useRoute, useRouter } from 'vue-router'
import RenameDialog from './components/RenameDialog.vue'
import NavBackToParentFolder from './components/NavBackToParentFolder.vue'
import { useIsActivated } from 'src/composition/useIsActivated'
import { ALL_VALUE } from 'src/const'
import { parseTime } from 'src/utils/time'
import { connectState } from 'src/services/utils'
import { NOOP } from 'src/const/empty'
import { HubConnectionState } from '@microsoft/signalr'
import { useLayout } from 'src/components/app/useLayout'
import ShelfCard from './components/ShelfCard.vue'
import { BookInList } from 'src/services/book/types'
import { useBookListStore } from 'stores/bookListData'

interface QSelectorOption {
  label: string
  value: string
  /** 格式化好的最后修改时间 */
  updateAt: string
  disable?: boolean
}

const $ = useQuasar()
const layout = useLayout()
const shelfStore = useShelfStore()
const bookListStore = useBookListStore()
const route = useRoute()
const router = useRouter()
/** 本组件是否激活展示 */
const isActivated = useIsActivated()

/** 站点header高度 */
const headerHeight = computed(() => `${layout.headerOffset.value}px`)
/** 加载标记 */
const loading = computed(() => shelfStore.useLoading().value || connectState.value !== HubConnectionState.Connected)
/** 选中项ID集合 */
const selected = computed(() => shelfStore.selected)
/** shelfStore 是否已经初始化 */
const initialized = computed(() => shelfStore.initialized)
/** 是否处于编辑模式 */
const editMode = computed(() => shelfStore.branch === ShelfBranch.draft)
/** 文件夹选择弹层 */
const folderSelectorVisible = ref(false)
/** 文件夹选择器model值 */
const selectorValue = ref<string | QSelectorOption | null>(null)
/** 右键菜单触发的Item ID */
const contextMenuShelfItemID = ref<number | string>(-1)
const contextMenuShelfItem = computed<ShelfTypes.ShelfFolderItem | BookInList | null>(() => {
  const { value: id } = contextMenuShelfItemID

  if (!id || id < 0) {
    return null
  }

  const shelfItem = shelfStore.shelfInMap.get(id)!

  if (shelfItem.type === ShelfTypes.ShelfItemTypeEnum.BOOK) {
    return bookListStore.getBook(+id)
  }

  return shelfItem
})
const contextMenuShelfItemTitle = computed(() => {
  if (selected.value.size) {
    return `已选${selected.value.size}项`
  }

  // 正常不会走到这个逻辑，这个分支只是make ts happy
  if (!contextMenuShelfItem.value) {
    return 'unknown'
  }

  return 'type' in contextMenuShelfItem.value ? contextMenuShelfItem.value.title : contextMenuShelfItem.value.Title
})
/** 文件夹选项 */
const folderOptions = computed<QSelectorOption[]>(() => {
  const realFolders = shelfStore.folders
    // 过滤掉自己，移动到自己没有意义
    .filter((i) => i.id !== parentFolder.value)
    .map(
      (i): QSelectorOption => ({
        label: i.title,
        value: i.id,
        updateAt: parseTime(i.updateAt).toLocaleString()
      })
    )
    .filter((i) => {
      // 如果 selectorValue 有值 且不是选项值
      if (selectorValue.value && typeof selectorValue.value !== 'object') {
        // 就筛选
        return i.label.includes(selectorValue.value)
      }

      return true
    })

  // 如果不在根文件夹
  if (parentFolder.value) {
    // 把根文件夹推入选项
    realFolders.push({
      label: ROOT_LEVEL_FOLDER_NAME,
      value: ALL_VALUE,
      updateAt: '系统创建'
    })
  }
  return realFolders
})
/** 选中计数 */
const selectedCount = computed(() => shelfStore.selectedCount)
/** 是否全选 */
// const isSelectedAll = computed<boolean>(() => selectedCount.value === shelf.value.length)
/** 排序列表容器 */
const [listWrapRef, setListWrapRef] = useForwardRef()
/** 排序操作句柄 */
const sortableRef = ref<Sortable | null>(null)

/** 父文件俺家数组 */
function getParentFolders(curRoute: RouteLocationNormalizedLoaded): string[] {
  if (!curRoute.params.folderID) {
    return []
  }

  if (Array.isArray(curRoute.params.folderID)) {
    return curRoute.params.folderID.filter((i) => !!i)
  }

  return [curRoute.params.folderID]
}

/** 是否有父文件夹(可能有多个); 初始值就解析一次 */
const parentFolders = ref<string[]>(getParentFolders(route))

/** 直接关系的父文件夹 */
const parentFolder = computed<string | null>(() => [...parentFolders.value].pop() ?? null)
/** 书架数据 */
const shelfData = computed<ShelfTypes.ShelfItem[]>(() => {
  return shelfStore.getItemsByParents(parentFolders.value)
})

/** 右键菜单 - 加入文件夹 */
function addItemToFolderHandle(item: ShelfTypes.ShelfItem) {
  if (selectedCount.value === 0) {
    shelfStore.selectItem({ id: item.id })
  }

  // 打开文件夹弹层
  folderSelectorVisible.value = true
}

/** 右键菜单 - 移出书架 */
async function removeItemHandle(item: ShelfTypes.ShelfItem) {
  // 没有选择书籍
  if (selectedCount.value === 0) {
    // 移除鼠标右键的那一本
    await shelfStore.removeFromShelf({ books: [item.id], push: false })
  } else {
    // 否则就是移除已经选中的
    await shelfStore.removeFromShelf({ books: shelfStore.selectedBooks.map((i) => i.id), push: false })
  }

  await removeFolderIfItEmpty()
}

/** 移除空文件夹 */
async function removeFolderIfItEmpty(): Promise<void> {
  // 如果是文件夹
  if (parentFolder.value) {
    const id = parentFolder.value
    // 且文件夹是空的
    if (!shelfData.value.length) {
      // 弹层询问用户是否要清空文件夹
      await new Promise((resolve, reject) => {
        $.dialog({
          title: '删除文件夹',
          message: '该文件夹为空，是否删除文件夹？',
          cancel: true
        })
          .onOk(resolve)
          .onCancel(reject)
      })
        .then(() => {
          shelfStore.deleteFolder({ id })
          // replace为父层
          router.replace({
            ...route,
            params: { folderID: parentFolders.value.filter((i) => i !== id) }
          })
        })
        .catch(NOOP)
    }
  }
}

/** 右键菜单 - 删除文件夹 */
function removeFolderHandle(item: ShelfTypes.ShelfFolderItem) {
  const { id } = item
  const children = shelfStore.getItemsByParent(id)
  Promise.resolve()
    .then(() => {
      // 判断是否还有子元素
      if (children.length) {
        // 弹二次确认
        return new Promise((resolve, reject) => {
          $.dialog({
            title: '删除文件夹',
            message: `该文件夹不为空，删除后内容会转移到${ROOT_LEVEL_FOLDER_NAME}`,
            cancel: true
          })
            .onOk(resolve)
            .onCancel(reject)
        })
      }
    })
    .then(() => {
      shelfStore.deleteFolder({ id })
    })
    .catch(() => {
      // 用户取消（或者代码有bug抛错）
    })
}

/** 右键菜单 - 移动到文件夹 */
function moveItemToFolderHandle(item: ShelfTypes.ShelfItem) {
  if (selectedCount.value === 0) {
    shelfStore.selectItem({ id: item.id })
  }

  // 打开文件夹弹层
  folderSelectorVisible.value = true
}

/** 文件夹选择器提交 */
async function folderSelectorSubmitHandle() {
  // 没有文件夹名称或者文件夹id的话就不知道要移去哪了，所以返回
  if (!selectorValue.value) {
    // 弹个toast
    $.notify({ type: 'warning', message: '请选择一个文件夹或者输入需要新建的文件夹名称' })
    return
  }

  // 保险逻辑，没有选中的话就不走下边的各种创建、修改逻辑了，保持原样
  if (!selected.value.size) {
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
    shelfStore.addToFolder({ parents: folderID === ALL_VALUE ? [] : [folderID] })

    await removeFolderIfItEmpty()
  }
}

/** 清理排序句柄 */
const destorySortable = () => {
  safeCall(() => sortableRef.value?.destroy())
}
/** 进入编辑模式 */
const enterEditMode = () => {
  shelfStore.checkout({ to: ShelfBranch.draft, reset: true })
  // 编辑模式下尽快查询所有书籍
  bookListStore.queryBooks({ ids: shelfStore.books.map((o) => o.id) })
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
  // make ts happy；实际运行 currentFolderToRename 理应一定有值
  if (currentFolderToRename.value?.id) {
    cb(shelfStore.renameFolder({ name, id: currentFolderToRename.value.id }))
  }
}

/** 屏蔽编辑模式下的列表有右键事件 */
function preventListContextMenuHandle(evt: MouseEvent) {
  if (editMode.value) {
    evt.preventDefault()
    // 不stop的话无法阻止menu组件弹出
    evt.stopPropagation()
  }
}

/** 列表项目点击 */
function listItemClickHandle(item: ShelfTypes.ShelfItem, evt: MouseEvent) {
  if (editMode.value) {
    const { id } = item
    if (id === undefined) {
      return
    }

    // 编辑模式下点击事件被蒙层接管，需要手动实现
    if (item.type === ShelfTypes.ShelfItemTypeEnum.FOLDER) {
      router.push({ ...route, params: { folderID: item.id } })
      return
    }

    // 是书籍，干掉点击防止跳转到书籍详情

    evt.preventDefault()
    evt.stopPropagation()

    // 选中书籍
    shelfStore.selectItem({ id })
  }
}

/** 备好右键菜单数据（菜单中展示对应书籍的某些元数据） */
function prepareBookContextDataHandle(item: ShelfTypes.ShelfItem) {
  if (!selected.value.size) {
    /** 设置好ID后让 vue.computed 自己监听数据数据请求情况 */
    contextMenuShelfItemID.value = item.id
  } else {
    /** 如果有已选的，置为-1，让菜单信息获取逻辑知道不需要特意去获取 */
    contextMenuShelfItemID.value = -1
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
  await shelfStore.submitChange()
}

/** 创建排序句柄 */
const createSortable = (el: HTMLElement) => {
  sortableRef.value = new Sortable(el, {
    animation: 400,
    // 不能拖动 no-drag 元素
    // filter: '.no-drag',
    // 不能用delay，和长按右键冲突
    // delay: 300,
    handle: '.js-drag-target',
    // 不能放在 no-drop 元素上
    onMove(evt) {
      if (evt.related.className.includes('no-drop')) return false

      return true
    },
    onEnd(evt) {
      // index 0 起步，但是在文件夹场景下第一个是返回上一层图标，需要处理
      let { oldIndex, newIndex } = evt

      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
        return
      }

      if (parentFolder.value) {
        oldIndex -= 1
        newIndex -= 1
      }

      syncSortInfoToDraft({ oldIndex, newIndex })
    }
  })
}

function getClass():string {
  let cls = ''
  cls += 'actions-wrap'
  if (editMode.value) {
    cls += ' actions-wrap-visible'
  }
  if ($.dark.isActive) {
    cls += ' bg-grey-10'
  } else {
    cls += ' bg-grey-1'
  }
  return cls
}

/** 监听路由 修改 parentFolders 值 */
watch(
  () => [route, isActivated] as const,
  ([nextRoute, nextActivated]) => {
    if (!nextActivated.value) {
      return
    }

    parentFolders.value = getParentFolders(nextRoute)
  },
  // immediate 保证mounted场景能触发
  { immediate: true, deep: true }
)

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
.actions-wrap-placeholder {
  height: 48px;
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
  box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%);
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

.shelf-item-dnd-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
}

// 文件夹选择弹层 相关
.shelf-folder-selector-card {
  min-width: 320px;
}

// 限制长度的文字
.max-len-text {
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
