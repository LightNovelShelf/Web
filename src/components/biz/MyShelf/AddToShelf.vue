<template>
  <q-btn
    v-if="book?.id"
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
import { computed, onMounted, ref } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { AnyVoidFunc } from '@/types/utils'
import { shelfDB } from '@/const/db'

const props = defineProps<{ book: { id: string } | null }>()

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

/** 切换收藏与否 */
const clickHandle = async () => {
  if (!props.book) {
    return
  }

  loading.value = true
  // 先取消，免得界面上有多个提示框
  if (disMiss) disMiss()

  if (liked.value) {
    await shelfDB.remove(props.book.id)
  } else {
    await shelfDB.set(props.book.id, props.book)
  }

  disMiss = $.notify({ message: liked.value ? '移除成功' : '加入成功' })

  liked.value = !liked.value
  loading.value = false
}

onMounted(async () => {
  liked.value = !!(props.book && (await shelfDB.get(props.book.id)))
  loading.value = false
})
</script>
