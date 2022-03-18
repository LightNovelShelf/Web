<!-- 书架文件夹选择弹层 -->
<template>
  <q-dialog v-model="visible" @hide="closeHandle">
    <q-card class="shelf-folder-selector-card">
      <q-card-section>
        <div class="text-h6">重命名为...</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="newName" autofocus label="输入文件夹名称" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="确认" color="primary" @click="renameHandle" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ShelfFolderItem } from 'src/types/shelf'
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: ShelfFolderItem | null
}>()

const emit = defineEmits<{
  (e: 'rename', name: string, cb: (promise: Promise<unknown> | void) => void): void
  (e: 'update:modelValue', modelValue: null): void
}>()

/** 文件夹名称 */
const newName = ref('')
/** 是否展示对话框 */
const visible = ref(false)
const loading = ref(false)

/** 监听到props更改，modelValue有值时打开弹层并设置初始input value */
watch(
  () => props.modelValue,
  (nextValue) => {
    visible.value = !!nextValue
    if (nextValue) {
      newName.value = nextValue.title
    }
  }
)

function closeHandle() {
  emit('update:modelValue', null)
}

/** 确定修改 */
function renameHandle() {
  emit('rename', newName.value, (result) => {
    loading.value = true
    Promise.resolve(result).finally(() => {
      loading.value = false
      closeHandle()
    })
  })
}
</script>
