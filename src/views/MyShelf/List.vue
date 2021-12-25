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
    cols="8"
    x-gap="20"
    y-gap="20"
    :forward-ref="setListWrapRef"
    @contextmenu="muteInEditMode"
  >
    <q-grid-item
      v-for="(item, index) in shelf"
      :key="item.value.Id"
      :data-idx="index"
      :data-item-id="item.value.Id"
      @click.capture="listItemClickHandle"
    >
      <div class="shelf-item-wrap" :data-type-a="ShelfTypes.SheldItemType.BOOK">
        <!-- 书籍 -->
        <book-card v-if="item.type === ShelfTypes.SheldItemType.BOOK" :book="item.value" :title="item.index" />
        <!-- 文件夹 -->
        <shelf-folder
          v-else-if="item.type === ShelfTypes.SheldItemType.FOLDER"
          :folder="item.value"
          :title="item.index"
        />
        <template v-else />

        <!-- 选中态icon; 暂时不允许folder加入folder（需要处理选中后出现的自身加入自身的场景） -->
        <div v-if="editMode && item.type !== ShelfTypes.SheldItemType.FOLDER" class="shelf-item-check-icon">
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
          <q-item-section>编辑</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-grid>

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
          label="选择文件夹"
          @input-value="selectorValue = $event"
          @update:model-value="selectorValue = $event"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 没有找到文件夹 </q-item-section>
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
import { nanoid } from 'nanoid'
import ShelfFolder from './components/ShelfFolder.vue'

defineComponent({ AddToShelf, QGrid, QGridItem, BookCard, ShelfFolder })

interface QSelectorOption {
  label: string
  value: string
}

/** auto freeze的话会导致vue绑定报错 */
setAutoFreeze(false)

const $ = useQuasar()
/** 加载标记 */
const loading = ref(true)
/** 编辑状态 */
const editMode = ref(false)
/**
 * 所有书籍
 * @private 考虑使用shelf代替
 **/
const _stableShelf = ref<ShelfTypes.ShelfItem[]>([])
/**
 * 编辑期间的书籍列表
 * @private 考虑使用shelf代替
 * @unorder 跟 _stableShelf 不一样，这个数组不保证按照index大小排好序
 * @immutable 请不要单独修改draft里的某一项，避免数据串通造成“取消保存”功能失效
 **/
let _draftShelf = ref<ShelfTypes.ShelfItem[]>([])
/** @public 用作渲染的书架列表 */
const shelf = computed<ShelfTypes.ShelfItem[]>({
  get() {
    return editMode.value ? _draftShelf.value : _stableShelf.value
  },
  set(val) {
    if (editMode.value) {
      _draftShelf.value = val
    } else {
      _stableShelf.value = val
    }
  }
})

/** 书架文件夹列表 */
const folders = computed<ShelfTypes.ShelfFolderItem[]>(() =>
  shelf.value.filter((i): i is ShelfTypes.ShelfFolderItem => i.type === ShelfTypes.SheldItemType.FOLDER)
)

/** 文件夹选择弹层 */
const folderSelectorVisible = ref(false)
/** 文件夹选择器model值 */
const selectorValue = ref<string | QSelectorOption | null>(null)
/** 文件夹选择器model值是否指代一个选项 */
// const selectorValueIsOption = computed(() => typeof selectorValue.value === 'object')
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

/** 文件夹选择器提交 */
function folderSelectorSubmitHandle() {
  if (!selectorValue.value) {
    return
  }

  /** 需要创建文件夹：值是字符串而不是option */

  const shouldCreateFolder = typeof selectorValue.value === 'string'
  /** 要更改的书籍 */
  const books = shelf.value.filter((i) => i.selected)

  // 保险逻辑，没有children的化就不走下边的各种创建、修改逻辑了，保持原样
  if (!books.length) {
    // 弹个toast
    $.notify({ type: 'warning', message: '请先选择要加入文件夹的项目' })
    return
  }

  // 1. 创建文件夹场景
  if (shouldCreateFolder) {
    /** 新的文件夹 */
    const folder: ShelfTypes.ShelfFolderItem = {
      // 固定在第一
      index: 0,
      type: ShelfTypes.SheldItemType.FOLDER,
      value: {
        Id: nanoid(),
        Title: selectorValue.value as string,
        children: books,
        createAt: Date.now()
      }
    }

    // 1. 把选中的项目从shelf中移除，只留下没选的

    shelf.value = shelf.value.filter((i) => !i.selected)

    // 2. 剩余项目往后挪一位，腾出第一个位置给新增的文件夹
    shelf.value.forEach((i) => (i.index += 1))

    // 3. 在第一位插入一个文件夹
    shelf.value.unshift(folder)

    // 4. 完成
    return
  }

  // 2. 加入文件夹场景

  // 1. 把选中的项目从shelf中移除，只留下没选的
  shelf.value = shelf.value.filter((i) => !i.selected)

  const folderID = (selectorValue.value as QSelectorOption).value

  // 2. 把children合并到目标文件夹中
  shelf.value.forEach((shelfItem) => {
    if (shelfItem.value.Id === folderID) {
      ;(shelfItem as ShelfTypes.ShelfFolderItem).value.children.push(...books)
    }
  })

  // 3. 完成
}

/** 选中计数 */
const selectedCount = computed<number>(() => shelf.value.filter((_) => _.selected).length)
/** 是否全选 */
const isSelectedAll = computed<boolean>(() => selectedCount.value === shelf.value.length)
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
  // 复制 _stableShelf 里的数据到 _draftShelf 中；toRaw一次可以让immer修改不触发vue hook
  _draftShelf.value = toRaw(_stableShelf.value)
  editMode.value = true
}
/** 退出编辑模式 */
const quiteEditMode = () => {
  // 清空 _draftShelf 数据，减少内存占用
  _draftShelf.value = []
  editMode.value = false
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

    const idx = (evt.currentTarget as HTMLElement).dataset.idx as string
    const type = shelf.value[+idx].type

    // 暂时不允许选中文件夹
    if (type === ShelfTypes.SheldItemType.FOLDER) {
      return
    }

    const curSelected = shelf.value[+idx].selected
    shelf.value[+idx].selected = !curSelected
  }
}

/** 全选/取消全选 */
function selectAllHandle() {
  const nextSelected = !isSelectedAll.value
  shelf.value.forEach((_) => {
    // 文件夹不允许选择
    if (_.type === ShelfTypes.SheldItemType.FOLDER) {
      return
    }

    _.selected = nextSelected
  })
}
/** 弹出书架文件夹选择弹层 */
function toggleShelfFolderSelector() {
  folderSelectorVisible.value = !folderSelectorVisible.value
  // 隐藏弹层时
  if (!folderSelectorVisible.value) {
    // 清空selector
    selectorValue.value = ''
  }
}

/** 同步排序结果到draft */
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
  shelf.value = produce(shelf.value, (draft) => {
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
    })

    // 不排序，因为sortable是直接操作dom的，draft不排序也不影响渲染
    // index修改也是遍历每一项做对比的，对于这个数组是否有序不关心
    // sortBooksToAsc(_stableShelf)
  })
}

/** 确认列表修改结果 */
const submitListChange = async () => {
  // 保存修改，把draft的苏剧写入stable
  // 浅复制一次，避免接下来的sort操作reactive 到 _draftShelf
  _stableShelf.value = [..._draftShelf.value]

  // _draft来的数据并不是有序的，这里需要排序一次
  sortBooksToAsc(_stableShelf)

  /** 写入本地缓存 */
  for (const item of _stableShelf.value) {
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
const sortBooksToAsc = (listRef: Ref<ShelfTypes.ShelfItem[]>) => {
  listRef.value.sort((a, b) => (a.index > b.index ? 1 : -1))
}

// 初始化
onMounted(() => {
  // 全量读取列表
  shelfDB.getItems().then((res) => {
    shelf.value = res
    sortBooksToAsc(shelf)
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

// 文件夹选择弹层 相关
.shelf-folder-selector-card {
  min-width: 300px;
}
</style>
