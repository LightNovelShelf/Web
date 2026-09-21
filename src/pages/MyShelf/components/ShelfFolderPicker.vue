<!-- 移动到文件夹：逐层下钻选目标层，可在任意层新建子文件夹 -->
<template>
  <q-dialog v-model="visible" @show="resetHandle">
    <q-card class="folder-picker-card">
      <q-card-section class="folder-picker-header">
        <div class="text-h6">移动 {{ movingIds.length }} 项到...</div>
        <shelf-breadcrumb :path="browsePath" :routing="false" root-label="书架" @select="browse = $event" />
      </q-card-section>

      <q-separator />

      <q-card-section class="folder-picker-body">
        <q-list v-if="children.length" separator>
          <q-item
            v-for="folder in children"
            :key="folder.id"
            clickable
            :disable="movingFolderIds.has(folder.id)"
            @click="browse = [...browse, folder.id]"
          >
            <q-item-section avatar>
              <q-icon name="mdiFolderOutline" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ folder.title }}</q-item-label>
              <q-item-label caption>{{ describe(folder) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="mdiChevronRight" />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="folder-picker-empty">这一层还没有子文件夹</div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="creating" class="folder-picker-create">
        <q-input
          v-model="newFolderName"
          dense
          autofocus
          :label="`在「${currentTitle}」下新建`"
          @keyup.enter="submitNewHandle"
        />
        <q-btn
          flat
          dense
          color="primary"
          label="创建并移入"
          :disable="!newFolderName.trim()"
          @click="submitNewHandle"
        />
      </q-card-section>

      <q-card-actions>
        <q-btn flat dense no-caps icon="mdiFolderPlusOutline" label="新建子文件夹" @click="creating = !creating" />
        <q-space />
        <q-btn v-close-popup flat label="取消" />
        <q-btn flat no-caps color="primary" :disable="!movable" :label="submitLabel" @click="submitHandle" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import { isSameFolderPath, useShelfStore } from '@/stores/shelf'

import { ShelfItemTypeEnum } from '@/types/shelf'

import ShelfBreadcrumb from './ShelfBreadcrumb.vue'

import type { ShelfFolderDestination, ShelfFolderItem } from '@/types/shelf'

const props = defineProps<{
  /** 待移动的项目ID */
  movingIds: (string | number)[]
  /** 这些项目现在所在的文件夹路径 */
  currentParents: string[]
}>()
const emit = defineEmits<{ submit: [destination: ShelfFolderDestination] }>()
const visible = defineModel<boolean>({ required: true })

const shelfStore = useShelfStore()
/** 当前浏览到的层 */
const browse = ref<string[]>([])
const creating = ref(false)
const newFolderName = ref('')

/** 选中的文件夹不能作为目标，下钻进去等于把它塞进自己里面 */
const movingFolderIds = computed(() => new Set(props.movingIds.filter((id): id is string => typeof id === 'string')))
const browsePath = computed(() => shelfStore.resolveFolderPath(browse.value) ?? [])
const currentTitle = computed(() => browsePath.value.at(-1)?.title ?? '我的书架')
const children = computed(() =>
  shelfStore
    .getItemsByParents(browse.value)
    .filter((item): item is ShelfFolderItem => item.type === ShelfItemTypeEnum.FOLDER),
)
const movable = computed(() => props.movingIds.length > 0 && !isSameFolderPath(browse.value, props.currentParents))
const submitLabel = computed(() =>
  movable.value ? `移动到「${currentTitle.value}」` : `已在「${currentTitle.value}」`,
)

function describe(folder: ShelfFolderItem): string {
  const folderCount = shelfStore
    .getItemsByParents([...folder.parents, folder.id])
    .filter((item) => item.type === ShelfItemTypeEnum.FOLDER).length
  const bookCount = shelfStore.booksInFolderTree(folder.id).length
  return `${folderCount} 个文件夹 · ${bookCount} 本书`
}

function resetHandle() {
  browse.value = []
  creating.value = false
  newFolderName.value = ''
}

function submitHandle() {
  if (!movable.value) return
  emit('submit', { kind: 'existing', parents: [...browse.value] })
  visible.value = false
}

function submitNewHandle() {
  const name = newFolderName.value.trim()
  if (!name) return
  emit('submit', { kind: 'new', name, parents: [...browse.value] })
  visible.value = false
}
</script>

<style lang="scss" scoped>
.folder-picker-card {
  width: 420px;
  max-width: 90vw;
}

.folder-picker-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.folder-picker-body {
  padding: 0;
  max-height: 40vh;
  overflow: auto;
}

.folder-picker-empty {
  padding: 24px;
  text-align: center;
  font-size: 12px;
  opacity: 0.6;
}

.folder-picker-create {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  .q-input {
    flex-grow: 1;
  }
}
</style>
