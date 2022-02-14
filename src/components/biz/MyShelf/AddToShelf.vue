<template>
  <!-- todo 这个icon要不要得考虑一下 -->
  <q-btn v-if="bookId" :outline="outline" :color="color" :loading="loading" :label="label" @click="clickHandle" />
</template>

<script lang="ts">
export default {}
</script>

<script lang="ts" setup>
// 加入书架按钮
import { computed, ref } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { AnyVoidFunc } from '@/types/utils'
import type { BookServicesTypes } from '@/services/book'
import { useShelfStore } from '@/store/shelf'
import { getErrMsg } from '@/utils/getErrMsg'
import { connectState } from '@/services/utils'
import { HubConnectionState } from '@microsoft/signalr'

const props = defineProps<{ book: BookServicesTypes.BookInList | null }>()

/** 目前的DB方案只能接受string类型的key */
const bookId = computed<number | null>(() => props.book?.Id ?? null)
const bookPath = ref<string[]>([])
const $ = useQuasar()
const shelfStore = useShelfStore()
/** 是否已经收藏 */
const liked = computed<boolean>(() => shelfStore.booksMap.has(bookId.value ?? -1))
/** 读取/写入中 */
const loading = computed(
  () => shelfStore.useLoading((s) => s.pull || s.push).value || connectState.value !== HubConnectionState.Connected
)
/** 收起最后一次通知 */
let disMiss: AnyVoidFunc

const icon = computed<string>(() => (liked.value ? mdiHeartRemoveOutline : mdiHeartOutline))
const label = computed<string>(() => (liked.value ? '移出书架' : '加入书架'))
const color = 'primary'
const outline = computed<boolean>(() => liked.value)

/** 切换收藏与否 */
const clickHandle = async () => {
  if (!bookId.value) {
    return
  }

  // 先取消，免得界面上有多个提示框
  if (disMiss) disMiss()

  const nextLike = !liked.value

  try {
    if (nextLike) {
      await shelfStore.addToShelf({ id: bookId.value })
    } else {
      await shelfStore.removeFromShelf({ books: [bookId.value], push: true })
    }
    disMiss = $.notify({ message: nextLike ? '加入成功' : '移除成功' })
  } catch (e) {
    disMiss = $.notify({ type: 'waring', message: getErrMsg(e) })
  }
}
</script>
