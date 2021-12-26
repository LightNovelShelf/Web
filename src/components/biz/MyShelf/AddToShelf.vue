<template>
  <q-btn
    v-if="bookId"
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
import { computed, ref, toRaw } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { AnyVoidFunc } from '@/types/utils'
import type { BookServicesTypes } from '@/services/book'
import * as ShelfTypes from '@/types/shelf'
import { useShelfStore } from '@/store/shelf'
import { getErrMsg } from '@/utils/getErrMsg'

const props = defineProps<{ book: BookServicesTypes.BookInList | null }>()

/** 目前的DB方案只能接受string类型的key */
const bookId = computed<string>(() => (props.book?.Id ?? '') + '')
const bookPath = ref<string[]>([])
const $ = useQuasar()
const shelfStore = useShelfStore()
/** 是否已经收藏 */
const liked = computed<boolean>(() => shelfStore.booksMap.has(bookId.value))
/** 读取/写入中 @todo 给pinia添加plugin让它可以识别是否有action在执行 */
const loading = ref(false)
/** 收起最后一次通知 */
let disMiss: AnyVoidFunc

const icon = computed<string>(() => (liked.value ? mdiHeartRemoveOutline : mdiHeartOutline))
const label = computed<string>(() => (liked.value ? '移出书架' : '加入书架'))
const color = 'primary'
const outline = computed<boolean>(() => (liked.value ? true : false))

/** 切换收藏与否 */
const clickHandle = async () => {
  if (!props.book) {
    return
  }

  // 先取消，免得界面上有多个提示框
  if (disMiss) disMiss()

  loading.value = true

  try {
    if (liked.value) {
      await shelfStore.removeFromShelf(bookId.value)
    } else {
      await shelfStore.addToShelf(props.book)
    }
    disMiss = $.notify({ message: liked.value ? '移除成功' : '加入成功' })
  } catch (e) {
    disMiss = $.notify({ type: 'waring', message: getErrMsg(e) })
  }

  loading.value = false
}
</script>
