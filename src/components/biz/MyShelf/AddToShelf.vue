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

<script lang="ts">
export default {}
</script>

<script lang="ts" setup>
// 加入书架按钮
import { computed, onMounted, ref, toRaw } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { AnyVoidFunc } from '@/types/utils'
import { shelfDB } from '@/utils/storage/db'
import type { BookServicesTypes } from '@/services/book'
import * as ShelfTypes from '@/types/shelf'

const props = defineProps<{ book: BookServicesTypes.BookInList | null }>()

const $ = useQuasar()
const liked = ref(false)
// 初始值为true，待 读取好书本的加入状态 再置为false
const loading = ref(true)
/** 收起最后一次通知 */
let disMiss: AnyVoidFunc

const icon = computed(() => (liked.value ? mdiHeartRemoveOutline : mdiHeartOutline))
const label = computed(() => (liked.value ? '移出书架' : '加入书架'))
const color = 'primary'
const outline = computed(() => (liked.value ? true : false))

/** 目前的DB方案只能接受string类型的key */
const bookIdInStr = computed(() => (props.book?.Id ?? '') + '')

/** 切换收藏与否 */
const clickHandle = async () => {
  if (!props.book) {
    return
  }

  loading.value = true
  // 先取消，免得界面上有多个提示框
  if (disMiss) disMiss()

  if (liked.value) {
    await shelfDB.remove(bookIdInStr.value)
  } else {
    const shelfItem: ShelfTypes.SheldItem = {
      type: ShelfTypes.SheldItemType.book,
      index: await shelfDB.length(),
      value: toRaw(props.book)
    }
    await shelfDB.set(bookIdInStr.value, shelfItem)
  }

  disMiss = $.notify({ message: liked.value ? '移除成功' : '加入成功' })

  liked.value = !liked.value
  loading.value = false
}

onMounted(async () => {
  liked.value = !!(props.book && (await shelfDB.get(bookIdInStr.value)))
  loading.value = false
})
</script>
