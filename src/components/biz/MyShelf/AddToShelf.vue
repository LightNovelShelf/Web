<template>
  <q-btn
    v-if="bookIdInStr"
    :outline="outline"
    :color="color"
    :loading="loading"
    :icon="icon"
    :label="label"
    @click="clickHandle"
  />
</template>

<script lang="ts" setup>
// 加入书架按钮
import { computed, onActivated, onMounted, ref, toRaw, watch } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { AnyVoidFunc } from '@/types/utils'
import { shelfDB } from '@/utils/storage/db'
import type { BookServicesTypes } from '@/services/book'
import * as ShelfTypes from '@/types/shelf'

const props = defineProps<{ book: BookServicesTypes.BookInList | null }>()

const bookPath = ref<string[]>([])
const $ = useQuasar()
/** 是否已经收藏 */
const liked = computed<boolean>(() => !!bookPath.value.length)
// 初始值为true，待 读取好书本的加入状态 再置为false
const loading = ref(true)
/** 收起最后一次通知 */
let disMiss: AnyVoidFunc
/** 目前的DB方案只能接受string类型的key */
const bookIdInStr = computed<string>(() => (props.book?.Id ?? '') + '')

const icon = computed<string>(() => (liked.value ? mdiHeartRemoveOutline : mdiHeartOutline))
const label = computed<string>(() => (liked.value ? '移出书架' : '加入书架'))
const color = 'primary'
const outline = computed<boolean>(() => (liked.value ? true : false))
const allShelf = ref<ShelfTypes.ShelfItem[]>([])

async function init() {
  if (!bookIdInStr.value) {
    return
  }

  /** 获取书籍在DB中的路径 */
  function checkBooksPath(root: ShelfTypes.ShelfItem[], stack: string[] = []) {
    for (const item of root) {
      if (item.type === ShelfTypes.ShelfItemType.BOOK) {
        if (item.value.Id + '' === bookIdInStr.value) {
          bookPath.value = [...stack, bookIdInStr.value]
          break
        }
      } else if (item.type === ShelfTypes.ShelfItemType.FOLDER) {
        checkBooksPath(item.value.children, [...stack, item.value.Id])
      } else {
        $.notify({ type: 'warning', message: '发现不明类型的书架内容' })
        break
      }
    }

    loading.value = false
  }

  allShelf.value = await shelfDB.getItems()
  checkBooksPath(allShelf.value)
}

/** 切换收藏与否 */
const clickHandle = async () => {
  if (!props.book) {
    return
  }

  loading.value = true

  // 先取消，免得界面上有多个提示框
  if (disMiss) disMiss()

  if (liked.value) {
    // 在顶层，直接移除
    if (bookPath.value.length === 1) {
      // 1. 移除DB
      await shelfDB.remove(bookIdInStr.value)
      // 2. 移除path记录
      bookPath.value = []
      // 3. 移除 allShelf 中的记录
      allShelf.value = allShelf.value.filter((i) => i.value)
    } else {
      /** @todo 适配递归文件夹 */
      const [folderID, bookID] = bookPath.value

      let idx = 0
      for (const item of allShelf.value) {
        if (item.value.Id === folderID) {
          const _item = item as ShelfTypes.ShelfFolderItem

          // 删除书籍
          _item.value.children = _item.value.children.filter((i) => i.value.Id + '' !== bookID)

          // 写入这个文件夹
          shelfDB.set(folderID, _item)
          // 更新allShelf
          allShelf.value[idx] = _item
          break
        }

        idx += 1
      }
    }

    disMiss = $.notify({ message: '移除成功' })
  } else {
    /** 遍历书架里的书籍，拿到最大的index */
    let maxIndex = -1

    /** 遍历顶层就可以 */
    allShelf.value.forEach((i) => {
      maxIndex = Math.max(i.index, maxIndex)
    })

    const shelfItem: ShelfTypes.ShelfItem = {
      type: ShelfTypes.ShelfItemType.BOOK,
      index: maxIndex + 1,
      value: toRaw(props.book)
    }

    bookPath.value = [bookIdInStr.value]

    await shelfDB.set(bookIdInStr.value, shelfItem)

    disMiss = $.notify({ message: '加入成功' })
  }

  loading.value = false
}

watch(bookIdInStr, init)
onMounted(init)
</script>
