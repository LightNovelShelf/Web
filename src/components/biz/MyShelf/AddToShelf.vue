<template>
  <q-btn :outline="outline" :color="color" :loading="loading" :icon="icon" :label="label" @click="clickHandle" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { mdiHeartOutline, mdiHeartRemoveOutline } from '@/plugins/icon/export'
import { useQuasar } from 'quasar'
import { delay } from '@/utils/delay'
import { AnyVoidFunc } from '@/types/utils'

export default defineComponent({
  setup() {
    const $ = useQuasar()
    const liked = ref(false)
    const loading = ref(false)
    /** 收起最后一次通知 */
    let disMiss: AnyVoidFunc

    const icon = computed(() => (liked.value ? mdiHeartRemoveOutline : mdiHeartOutline))
    const label = computed(() => (liked.value ? '移出书架' : '加入书架'))
    const color = 'primary'
    const outline = computed(() => (liked.value ? true : false))

    /** 切换收藏与否 */
    const clickHandle = async () => {
      loading.value = true
      // 先取消，免得界面上有多个提示框
      if (disMiss) disMiss()

      /** @todo 切换为真正的加入移除操作 */
      await delay()()

      disMiss = $.notify({ message: liked.value ? '移除成功' : '加入成功' })

      liked.value = !liked.value
      loading.value = false
    }

    return { icon, label, color, loading, outline: outline, clickHandle }
  }
})
</script>
