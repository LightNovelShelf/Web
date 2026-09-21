<!-- 书架文件夹重命名弹层 -->
<template>
  <q-dialog v-model="visible" @hide="closeHandle">
    <q-card class="shelf-folder-selector-card">
      <q-card-section>
        <div class="text-h6">重命名为...</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="newName" autofocus label="输入文件夹名称" @keyup.enter="renameHandle" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="确认" color="primary" @click="renameHandle" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import type { ShelfFolderItem } from '@/types/shelf'

const props = defineProps<{
  modelValue: ShelfFolderItem | null
}>()

const emit = defineEmits<{
  (e: 'rename', name: string, done: (success: boolean) => void): void
  (e: 'update:modelValue', modelValue: null): void
}>()

/** 文件夹名称 */
const newName = ref('')
/** 是否展示对话框 */
const visible = ref(false)

/** 监听到props更改，modelValue有值时打开弹层并设置初始input value */
watch(
  () => props.modelValue,
  (nextValue) => {
    visible.value = !!nextValue
    if (nextValue) {
      newName.value = nextValue.title
    }
  },
)

function closeHandle() {
  emit('update:modelValue', null)
}

/** 确定修改；重名之类的校验没过就留在弹层里 */
function renameHandle() {
  emit('rename', newName.value, (success) => {
    if (success) closeHandle()
  })
}
</script>

<style scoped>
.shelf-folder-selector-card {
  min-width: 320px;
}
</style>
