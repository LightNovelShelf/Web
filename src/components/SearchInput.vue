<template>
  <q-input
    :model-value="keyword"
    @update:model-value="syncHandle"
    @keyup.enter="searchHandle()"
    @click="visible = true"
    @focus="visible = true"
    @blur="visible = false"
    ref="inputEleRef"
    :style="{ flexBasis: searchBarWidth, maxWidth: props.maxWidth }"
  >
    <q-menu
      no-focus
      no-refocus
      persistent
      no-parent-event
      v-model="visible"
      :offset="[0, 2]"
      :max-width="props.maxWidth"
      :style="{
        width: searchBarWidth,
        maxWidth: props.maxWidth
      }"
    >
      <q-list v-show="!!keyword">
        <q-item clickable v-close-popup @click="searchHandle(true)">
          <q-item-section>
            <div class="ellipsis full-width">精确搜索: {{ keyword }}</div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-input>
</template>

<script lang="ts" setup>
import { useMergeState } from '@/composition/useMergeState'
import { computed, ref, toRefs } from 'vue'
const props = withDefaults(defineProps<{ modelValue?: string; maxWidth?: string }>(), {
  modelValue: '',
  maxWidth: '600px'
})
const emits = defineEmits<{ (e: 'search', val: string): void; (e: 'update:modelValue', val: string): void }>()

const inputEleRef = ref<HTMLInputElement | null>(null)

const [keyword] = useMergeState(toRefs(props).modelValue)

/**
 * 理想弹层交互
 * 1. input focus的时候展开弹层
 * 2. 展开状态下再次点击input不会收起弹层（quasr会触发收起操作）
 * 3. 点击了弹层的某一项会收起弹层
 * 4. 点击空白处会收起弹层（input blur不等于点击空白处，有可能是点击了弹层某个不是选项的位置）
 */

const visible = ref(false)

const searchBarWidth = computed(() => {
  return visible.value ? '40vw' : 'auto'
})

function syncHandle(evt: string | number | null) {
  if (evt && typeof evt === 'string') {
    emits('update:modelValue', evt)
    keyword.value = evt
  }
}

function searchHandle(exact = false) {
  const key = exact ? `"${keyword.value}"` : keyword.value

  emits('update:modelValue', key)
  emits('search', key)

  // 因为点menu的话一定会blur没法避免，所以这里统一blur（即使是按回车触发的search）
  inputEleRef.value?.blur()
}
</script>
<style lang="scss" scoped></style>
