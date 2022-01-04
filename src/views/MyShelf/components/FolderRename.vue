<template>
  <slot :visible="visible" :on-click="clickHandle"></slot>

  <!-- 重命名操作弹层 -->
  <q-dialog v-if="visible">
    <!-- @toodo -->
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/** 事件 */
const emit = defineEmits<{ (e: 'rename', name: string): void }>()

/** 文件夹名称 */
const newName = ref('')
/** 是否展示对话框 */
const visible = ref(false)

/** slot被点击了 */
function clickHandle(name: string) {
  visible.value = true
  newName.value = name
}
/** 确定修改 */
function renameHandle() {
  emit('rename', newName.value)
}
</script>
