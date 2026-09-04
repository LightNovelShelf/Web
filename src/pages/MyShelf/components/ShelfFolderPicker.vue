<template>
  <q-dialog v-model="visible" @hide="selection = null">
    <q-card class="shelf-folder-selector-card">
      <q-card-section>
        <div class="text-h6">{{ parentFolder ? '移动' : '加入' }}到...</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-select
          filled
          :model-value="selection"
          :options="options"
          use-input
          fill-input
          hide-selected
          input-debounce="0"
          label="输入文件夹名称进行筛选或创建"
          @input-value="selection = $event"
          @update:model-value="selection = $event"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                {{ selection ? '没有找到，将新建文件夹' : '请输入文件夹名称' }}
              </q-item-section>
            </q-item>
          </template>
          <template #option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label class="max-len-text">{{ scope.opt.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>{{ scope.opt.updatedAt }}</q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" :disable="!selection || selectedCount === 0" :label="submitLabel" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { parseTime } from '@/utils/time'

import { ROOT_LEVEL_FOLDER_NAME } from '@/types/shelf'

import type { ShelfFolderDestination, ShelfFolderItem } from '@/types/shelf'

interface FolderOption {
  label: string
  value: string | null
  updatedAt: string
}

const props = defineProps<{
  folders: ShelfFolderItem[]
  parentFolder: string | null
  selectedCount: number
}>()
const emit = defineEmits<{ submit: [destination: ShelfFolderDestination] }>()
const visible = defineModel<boolean>({ required: true })
const selection = ref<string | FolderOption | null>(null)

const options = computed<FolderOption[]>(() => {
  const search = typeof selection.value === 'string' ? selection.value : ''
  const folders = props.folders
    .filter((folder) => folder.id !== props.parentFolder && (!search || folder.title.includes(search)))
    .map((folder) => ({
      label: folder.title,
      value: folder.id,
      updatedAt: parseTime(folder.updateAt).toLocaleString(),
    }))

  if (props.parentFolder) {
    folders.push({ label: ROOT_LEVEL_FOLDER_NAME, value: null, updatedAt: '系统创建' })
  }
  return folders
})

const submitLabel = computed(() => {
  const action = props.parentFolder ? '移动' : '加入'
  return typeof selection.value === 'object' && selection.value
    ? `${action}(${props.selectedCount})`
    : `创建并${action}(${props.selectedCount})`
})

function submit() {
  if (!selection.value || props.selectedCount === 0) return

  if (typeof selection.value === 'string') {
    emit('submit', { kind: 'new', name: selection.value })
  } else {
    emit('submit', {
      kind: 'existing',
      parents: selection.value.value === null ? [] : [selection.value.value],
    })
  }
  visible.value = false
}
</script>

<style scoped>
.shelf-folder-selector-card {
  min-width: 320px;
}

.max-len-text {
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
