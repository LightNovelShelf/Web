<template>
  <q-input
    :model-value="keyword"
    @update:model-value="syncHandle"
    @keyup.enter="searchHandle()"
    @click="onOpenMenuIfCan()"
    @focus="onOpenMenuIfCan()"
    @blur="onBlur"
    ref="inputEleRef"
    :style="{ flexBasis: searchBarWidth, maxWidth: props.maxWidth }"
  >
    <q-menu
      no-focus
      no-refocus
      no-parent-event
      v-model="visible"
      :offset="[0, 2]"
      :max-width="props.maxWidth"
      :style="{
        width: searchBarWidth,
        maxWidth: props.maxWidth,
      }"
    >
      <q-list v-show="!!keyword">
        <q-item v-for="opt in menuOptions" :key="opt.mode" :data-mode="opt.mode" clickable>
          <q-item-section>
            <div class="ellipsis full-width">{{ opt.label }}: {{ keyword }}</div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-input>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'

import { useMergeState } from 'src/composition/useMergeState'

import type { SearchMode } from 'src/services/book/types'

const props = withDefaults(
  defineProps<{ width?: (visible: boolean) => string; modelValue?: string; maxWidth?: string }>(),
  {
    modelValue: '',
  },
)
const emits = defineEmits<{
  (e: 'search', val: string, mode: SearchMode): void
  (e: 'update:modelValue', val: string): void
}>()

/** 下拉菜单的搜索维度选项 */
const menuOptions: { mode: SearchMode; label: string }[] = [
  { mode: 'exact', label: '精确搜索' },
  { mode: 'title', label: '按书名' },
  { mode: 'author', label: '按作者' },
  { mode: 'name', label: '按系列名' },
  { mode: 'tags', label: '按标签(逗号分隔多个)' },
]

const inputEleRef = ref<HTMLInputElement | null>(null)

const [keyword] = useMergeState(toRefs(props).modelValue)
/**
 * 理想弹层交互
 * 1. input focus的时候展开弹层
 * 2. 展开状态下再次点击input不会收起弹层（quasar会触发收起操作）
 * 3. 点击了弹层的某一项会收起弹层
 * 4. 点击空白处会收起弹层（input blur不等于点击空白处，有可能是点击了弹层某个不是选项的位置）
 */

const visible = ref(false)

const searchBarWidth = computed(() => {
  return props.width!(visible.value)
})

/** 在有 keyword 的时候打开下拉菜单
 *
 * 出于未知原因，在没有keyword（也就是下拉菜单没有item）的情况下打开menu会导致menu无法再打开（除非先close
 */
function onOpenMenuIfCan() {
  visible.value = !!keyword.value
}

// 在某次框架更新中，onblur事件比click触发早了，需要手动跳转
function onBlur(evt: any) {
  //onBlur时调用handle：从被点击的菜单项 dataset 上取搜索维度
  const item = (evt.relatedTarget as HTMLElement)?.closest?.('[data-mode]') as HTMLElement | null
  const mode = item?.dataset?.mode as SearchMode | undefined
  if (mode) {
    searchHandle(mode)
  }
  visible.value = false
}

function syncHandle(evt: string | number | null) {
  if (typeof evt === 'string') {
    emits('update:modelValue', evt)
    keyword.value = evt
  }

  onOpenMenuIfCan()
}

/** 触发搜索，默认回车走标题模糊搜索 */
function searchHandle(mode: SearchMode = 'fuzzy') {
  emits('update:modelValue', keyword.value)
  if (!keyword.value) return
  emits('search', keyword.value, mode)

  // 因为点menu的话一定会blur没法避免，所以这里统一blur（即使是按回车触发的search）
  inputEleRef.value?.blur()
}
</script>
<style lang="scss" scoped></style>
