<!-- 书架路径导航：点任意一层直接跳到那一层 -->
<template>
  <q-breadcrumbs class="shelf-breadcrumb" gutter="none" active-color="primary">
    <template #separator>
      <q-icon class="shelf-breadcrumb-separator" name="mdiChevronRight" size="16px" />
    </template>

    <q-breadcrumbs-el v-bind="elAttrs([])" icon="mdiFolderHeartOutline" :label="rootLabel" @click="selectHandle([])" />
    <q-breadcrumbs-el
      v-for="(folder, depth) in path"
      :key="folder.id"
      v-bind="elAttrs(idsUntil(depth))"
      :label="folder.title"
      @click="selectHandle(idsUntil(depth))"
    />
  </q-breadcrumbs>
</template>

<script lang="ts" setup>
import type { ShelfFolderItem } from '@/types/shelf'

const props = withDefaults(
  defineProps<{
    /** 从根到当前层的文件夹链 */
    path: ShelfFolderItem[]
    /** 每一层渲染成书架路由链接；关掉则改为派发 select 事件（弹层内选目录用） */
    routing?: boolean
    rootLabel?: string
  }>(),
  { routing: true, rootLabel: '我的书架' },
)

const emit = defineEmits<{ select: [parents: string[]] }>()

function idsUntil(depth: number): string[] {
  return props.path.slice(0, depth + 1).map((folder) => folder.id)
}

function elAttrs(parents: string[]) {
  return props.routing ? { to: { name: 'MyShelf', params: { folderID: parents } } } : { class: 'cursor-pointer' }
}

function selectHandle(parents: string[]) {
  if (!props.routing) emit('select', parents)
}
</script>

<style lang="scss" scoped>
.shelf-breadcrumb {
  font-size: 14px;

  :deep(.q-breadcrumbs__el) {
    max-width: 12em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.shelf-breadcrumb-separator {
  opacity: 0.5;
}
</style>
